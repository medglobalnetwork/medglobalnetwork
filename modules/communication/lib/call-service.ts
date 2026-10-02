// ============================================================
// MGN Call Service (1:1 WebRTC)
// modules/communication/lib/call-service.ts
//
// Signaling lives in Postgres because the app runs on serverless
// Next.js, where an in-memory mailbox is not shared between
// invocations.
// ============================================================

import { pool } from "@/lib/auth";
import { pushToUser } from "@/lib/push";

export type CallType = "VOICE" | "VIDEO";
export type CallStatus = "ringing" | "accepted" | "declined" | "ended" | "missed";
export type SignalKind = "offer" | "answer" | "ice" | "hangup" | "mute" | "video";

/** A ringing call that goes unanswered for this long is closed as missed. */
const RING_TIMEOUT_SECONDS = 45;

export class CallService {
  /**
   * Places a call and pushes the ring to the callee's devices so the
   * WebView wakes up with the incoming-call screen.
   */
  static async initiate(params: {
    callerId: string;
    calleeId: string;
    callType: CallType;
    conversationId?: string | null;
    callerName?: string | null;
  }) {
    const { callerId, calleeId, callType, conversationId = null, callerName } = params;

    // One live call per pair — a second dial supersedes the first.
    await pool.query(
      `UPDATE calls
          SET status = 'ended', ended_at = NOW(), end_reason = 'superseded'
        WHERE status IN ('ringing', 'accepted')
          AND ((caller_id = $1 AND callee_id = $2) OR (caller_id = $2 AND callee_id = $1))`,
      [callerId, calleeId]
    );

    const inserted = await pool.query<{ id: string; created_at: Date }>(
      `INSERT INTO calls (caller_id, callee_id, call_type, conversation_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [callerId, calleeId, callType, conversationId]
    );

    const call = inserted.rows[0];
    if (!call) throw new Error("Failed to create call");

    void pushToUser(
      calleeId,
      {
        title: callType === "VIDEO" ? "Incoming video call" : "Incoming voice call",
        body: callerName ? `${callerName} is calling you` : "Someone is calling you",
        channelId: "calls",
        data: {
          kind: "call",
          callId: call.id,
          callType,
          callerId,
        },
      },
      "calls"
    ).catch((err) => console.error("[CallService] ring push failed:", err));

    return call;
  }

  static async getCall(callId: string) {
    const res = await pool.query(
      `SELECT c.*,
              cu.name AS caller_name, cu.image AS caller_image,
              te.name AS callee_name, te.image AS callee_image
         FROM calls c
         JOIN "user" cu ON cu.id = c.caller_id
         JOIN "user" te ON te.id = c.callee_id
        WHERE c.id = $1`,
      [callId]
    );
    return res.rows[0] ?? null;
  }

  static async isParticipant(callId: string, userId: string): Promise<boolean> {
    const res = await pool.query(
      `SELECT 1 FROM calls WHERE id = $1 AND (caller_id = $2 OR callee_id = $2)`,
      [callId, userId]
    );
    return res.rows.length > 0;
  }

  /**
   * The caller's live call, if any. The callee side polls for a ringing
   * call instead (see findIncoming).
   */
  static async findActiveForCaller(userId: string) {
    const res = await pool.query(
      `SELECT * FROM calls
        WHERE caller_id = $1 AND status IN ('ringing', 'accepted')
        ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return res.rows[0] ?? null;
  }

  /** Ringing calls addressed to this user that they have not yet resolved. */
  static async findIncoming(userId: string) {
    const res = await pool.query(
      `SELECT * FROM calls
        WHERE callee_id = $1 AND status = 'ringing'
          AND created_at > NOW() - INTERVAL '${RING_TIMEOUT_SECONDS} seconds'
        ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return res.rows[0] ?? null;
  }

  /** Moves a ringing call to accepted. Only the callee may accept. */
  static async accept(callId: string, userId: string) {
    const res = await pool.query<{ id: string }>(
      `UPDATE calls
          SET status = 'accepted', answered_at = NOW(), started_at = COALESCE(started_at, NOW())
        WHERE id = $1 AND callee_id = $2 AND status = 'ringing'
        RETURNING id`,
      [callId, userId]
    );
    return res.rows.length > 0;
  }

  /**
   * Ends a call from either side. `declined` is only used while still
   * ringing; after that every termination is a plain end.
   */
  static async end(
    callId: string,
    userId: string,
    reason: "declined" | "hangup" | "missed" | "busy" = "hangup"
  ) {
    const status: CallStatus = reason === "declined" ? "declined" : "ended";
    const res = await pool.query<{ callee_id: string; caller_id: string }>(
      `UPDATE calls
          SET status = $3, ended_at = NOW(), end_reason = $4
        WHERE id = $1
          AND (caller_id = $2 OR callee_id = $2)
          AND status IN ('ringing', 'accepted')
        RETURNING caller_id, callee_id`,
      [callId, userId, status, reason]
    );

    const row = res.rows[0];
    if (!row) return false;

    // Tell the other side so neither peer is left on a dead connection.
    const peerId = row.caller_id === userId ? row.callee_id : row.caller_id;
    await this.signal(callId, userId, peerId, "hangup", { reason }).catch((err) =>
      console.error("[CallService] hangup signal failed:", err)
    );
    return true;
  }

  /** Closes ringing calls nobody answered. Safe to call on every poll. */
  static async sweepMissed(): Promise<number> {
    const res = await pool.query(
      `UPDATE calls
          SET status = 'missed', ended_at = NOW(), end_reason = 'no_answer'
        WHERE status = 'ringing'
          AND created_at < NOW() - INTERVAL '${RING_TIMEOUT_SECONDS} seconds'`
    );
    return res.rowCount ?? 0;
  }

  /** Queues a signaling message for the peer. */
  static async signal(
    callId: string,
    fromUser: string,
    toUser: string,
    kind: SignalKind,
    payload: unknown
  ) {
    await pool.query(
      `INSERT INTO call_signals (call_id, from_user, to_user, kind, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [callId, fromUser, toUser, kind, JSON.stringify(payload ?? {})]
    );
  }

  /**
   * Drains the caller's pending signals. `afterId` is the cursor from the
   * previous poll; anything at or below it was already handled.
   */
  static async drainSignals(callId: string, userId: string, afterId = 0) {
    const res = await pool.query<{ id: string; kind: SignalKind; payload: any }>(
      `WITH claimed AS (
         UPDATE call_signals
            SET consumed = TRUE
          WHERE id IN (
            SELECT id FROM call_signals
             WHERE call_id = $1 AND to_user = $2 AND consumed = FALSE AND id > $3
             ORDER BY id
             LIMIT 100
             FOR UPDATE SKIP LOCKED
          )
          RETURNING id, kind, payload
       )
       SELECT id, kind, payload FROM claimed ORDER BY id`,
      [callId, userId, afterId]
    );
    return res.rows;
  }

  static async latestSignalId(callId: string): Promise<number> {
    const res = await pool.query<{ last: string | null }>(
      `SELECT MAX(id)::text AS last FROM call_signals WHERE call_id = $1`,
      [callId]
    );
    return parseInt(res.rows[0]?.last ?? "0", 10);
  }
}