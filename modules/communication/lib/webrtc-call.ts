// ============================================================
// MGN WebRTC Call Engine
// modules/communication/lib/webrtc-call.ts
//
// One RTCPeerConnection per call, signaling over the /api/calls
// signaling mailbox. Only the caller sends the offer; the callee
// answers. ICE candidates flow both ways.
// ============================================================

export type CallMedia = "VOICE" | "VIDEO";
export type CallPhase =
  | "idle"
  | "requesting-media"
  | "ringing-out"
  | "ringing-in"
  | "connecting"
  | "active"
  | "ended";

export type CallPeer = {
  id: string;
  name?: string | null;
  image?: string | null;
};

type Events = {
  phase: (phase: CallPhase) => void;
  localStream: (stream: MediaStream) => void;
  remoteStream: (stream: MediaStream) => void;
  ended: (reason: string) => void;
  error: (message: string) => void;
};

const POLL_MS = 500;
const CALLER_ICE_GATHER_MS = 2500;

export class WebRTCCall {
  private pc: RTCPeerConnection | null = null;
  private local: MediaStream | null = null;
  private remote: MediaStream | null = null;
  private poller: ReturnType<typeof setInterval> | null = null;
  private cursor = 0;
  private disposed = false;
  private listeners: { [K in keyof Events]: Set<Events[K]> } = {
    phase: new Set(),
    localStream: new Set(),
    remoteStream: new Set(),
    ended: new Set(),
    error: new Set(),
  };

  constructor(
    private readonly opts: {
      callId: string;
      selfId: string;
      peer: CallPeer;
      role: "caller" | "callee";
      media: CallMedia;
    }
  ) {}

  on<K extends keyof Events>(event: K, handler: Events[K]): () => void {
    this.listeners[event].add(handler as never);
    return () => this.listeners[event].delete(handler as never);
  }

  private emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>) {
    this.listeners[event].forEach((fn) => (fn as (...a: unknown[]) => void)(...args));
  }

  private setPhase(phase: CallPhase) {
    this.emit("phase", phase);
  }

  /** Acquires media, wires the peer connection and starts signaling. */
  async start(): Promise<void> {
    if (this.disposed) return;

    this.setPhase("requesting-media");

    try {
      this.local = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: this.opts.media === "VIDEO"
          ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      const message =
        name === "NotAllowedError"
          ? "Microphone and camera permission was denied."
          : name === "NotFoundError"
            ? "No microphone or camera found on this device."
            : "Could not start audio or video.";
      this.emit("error", message);
      this.setPhase("ended");
      throw err;
    }

    this.emit("localStream", this.local);

    await this.createPeerConnection();
    this.local.getTracks().forEach((track) => {
      this.pc?.addTrack(track, this.local!);
    });

    this.startPolling();

    if (this.opts.role === "caller") {
      this.setPhase("ringing-out");
      await this.sendOffer();
    } else {
      this.setPhase("ringing-in");
    }
  }

  private async createPeerConnection() {
    let servers: RTCIceServer[] = [];
    try {
      const res = await fetch("/api/calls/ice-servers", { credentials: "include" });
      if (res.ok) servers = (await res.json()).servers ?? [];
    } catch {
      // Fall back to the public STUN defaults below.
    }
    if (servers.length === 0) {
      servers = [{ urls: "stun:stun.l.google.com:19302" }];
    }

    const pc = new RTCPeerConnection({ iceServers: servers, iceCandidatePoolSize: 10 });
    this.pc = pc;

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      this.remote = stream;
      this.emit("remoteStream", stream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        void this.send("ice", event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        this.setPhase("active");
      } else if (state === "failed") {
        this.emit("error", "The connection could not be established.");
        void this.dispose("connection_failed");
      } else if (state === "disconnected") {
        // Brief drops are normal on mobile networks; let ICE recover.
        this.setPhase("connecting");
      }
    };
  }

  private async sendOffer() {
    if (!this.pc) return;
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // Trickle ICE, but give gathering a short head start so the common
    // case (host candidates only) answers in one round trip.
    await Promise.race([
      this.waitForIceGathering(),
      new Promise((resolve) => setTimeout(resolve, CALLER_ICE_GATHER_MS)),
    ]);

    await this.send("offer", { sdp: this.pc.localDescription?.sdp, type: "offer" });
  }

  private waitForIceGathering(): Promise<void> {
    const pc = this.pc;
    if (!pc || pc.iceGatheringState === "complete") {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const check = () => {
        if (pc.iceGatheringState === "complete") {
          pc.removeEventListener("icegatheringstatechange", check);
          resolve();
        }
      };
      pc.addEventListener("icegatheringstatechange", check);
    });
  }

  private async send(kind: string, payload: unknown) {
    try {
      await fetch(`/api/calls/${this.opts.callId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind, payload }),
      });
    } catch (err) {
      console.error("[WebRTCCall] failed to send signal:", err);
    }
  }

  private startPolling() {
    void this.poll();
    this.poller = setInterval(() => void this.poll(), POLL_MS);
  }

  private async poll() {
    if (this.disposed) return;
    try {
      const res = await fetch(
        `/api/calls/${this.opts.callId}/signal?after=${this.cursor}`,
        { credentials: "include" }
      );
      if (!res.ok) return;

      const data = await res.json();
      for (const signal of data.signals ?? []) {
        this.cursor = Number(signal.id) || this.cursor;
        await this.handleSignal(signal.kind, signal.payload);
      }

      if (data.status === "declined" || data.status === "ended" || data.status === "missed") {
        this.emit("ended", data.status);
        void this.dispose(data.status);
      }
    } catch {
      // Transient network failure — the next tick retries.
    }
  }

  private async handleSignal(kind: string, payload: any) {
    switch (kind) {
      case "offer": {
        if (this.opts.role !== "callee" || !this.pc) return;
        await this.pc.setRemoteDescription(payload);
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        await this.send("answer", { sdp: this.pc.localDescription?.sdp, type: "answer" });
        this.setPhase("connecting");
        break;
      }

      case "answer": {
        if (this.opts.role !== "caller" || !this.pc) return;
        // setRemoteDescription throws if an offer was never sent — ignore duplicates.
        if (this.pc.signalingState === "have-local-offer") {
          await this.pc.setRemoteDescription(payload);
          this.setPhase("connecting");
        }
        break;
      }

      case "ice": {
        if (!this.pc || !payload) return;
        try {
          await this.pc.addIceCandidate(payload);
        } catch {
          // A rejected candidate is normal when both ends restart ICE.
        }
        break;
      }

      case "hangup":
        this.emit("ended", payload?.reason ?? "hangup");
        void this.dispose(payload?.reason ?? "hangup");
        break;

      case "mute":
      case "video":
        // Mid-call media state is advisory; the UI syncs optimistically.
        break;
    }
  }

  setMuted(muted: boolean) {
    this.local?.getAudioTracks().forEach((t) => (t.enabled = !muted));
    void this.send("mute", { muted });
  }

  setCameraEnabled(enabled: boolean) {
    this.local?.getVideoTracks().forEach((t) => (t.enabled = enabled));
    void this.send("video", { enabled });
  }

  /** Replaces the outgoing camera track when toggling between voice and video. */
  async setVideoEnabled(enabled: boolean): Promise<void> {
    const track = this.local?.getVideoTracks()[0];
    if (enabled && !track) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newTrack = stream.getVideoTracks()[0];
      this.local?.addTrack(newTrack);
      const sender = this.pc?.getSenders().find((s) => s.track?.kind === "video");
      await sender?.replaceTrack(newTrack);
      return;
    }
    if (track) {
      track.enabled = enabled;
      void this.send("video", { enabled });
    }
  }

  getLocalStream() {
    return this.local;
  }

  getRemoteStream() {
    return this.remote;
  }

  /** Tears everything down locally. Idempotent. */
  async dispose(reason = "hangup") {
    if (this.disposed) return;
    this.disposed = true;

    if (this.poller) clearInterval(this.poller);
    this.poller = null;

    this.local?.getTracks().forEach((t) => t.stop());
    this.remote?.getTracks().forEach((t) => t.stop());
    this.local = null;
    this.remote = null;

    try {
      this.pc?.close();
    } catch {
      // Already closed
    }
    this.pc = null;

    if (reason !== "local") {
      void this.send("hangup", { reason });
    }
  }
}