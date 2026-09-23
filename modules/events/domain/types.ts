// ============================================================
// MGN Events Domain Types
// modules/events/domain/types.ts
// ============================================================

export type EventType =
  | "conference"
  | "cme"
  | "workshop"
  | "webinar"
  | "seminar"
  | "symposium"
  | "exhibition"
  | "networking"
  | "training"
  | "academic"
  | "meetup"
  | "career";

export type EventFormat = "online" | "in_person" | "hybrid";

export type EventStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "paused"
  | "cancelled"
  | "completed"
  | "archived";

export interface EventSpeaker {
  id: string;
  event_id?: string;
  user_id?: string | null;
  name: string;
  title?: string | null;
  organization?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  topic?: string | null;
  order_index?: number;
}

export interface EventAgendaItem {
  id: string;
  event_id?: string;
  title: string;
  description?: string | null;
  speaker_name?: string | null;
  start_time: string;
  end_time: string;
  order_index?: number;
}

export interface EventRecord {
  id: string;
  slug: string;
  title: string;
  event_type: EventType;
  category: string;
  short_description?: string | null;
  description: string;
  cover_url?: string | null;
  organizer_type: "individual" | "organization";
  organizer_id: string;
  organization_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  organization_verification?: string | null;
  organizer_name?: string | null;
  organizer_image?: string | null;
  organizer_profession?: string | null;
  organizer_verified?: boolean;
  start_time: string;
  end_time: string;
  timezone: string;
  format: EventFormat;
  venue_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  online_meeting_url?: string | null;
  online_meeting_platform?: string | null;
  price: number;
  currency: string;
  is_free: boolean;
  capacity?: number | null;
  registered_count: number;
  cme_credits?: number | null;
  cme_accreditation_body?: string | null;
  certificate_enabled: boolean;
  certificate_template?: string | null;
  status: EventStatus;
  rejection_reason?: string | null;
  requirements?: string[] | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  speakers?: EventSpeaker[];
  agenda?: EventAgendaItem[];
  is_user_registered?: boolean;
}

export interface CreateEventInput {
  title: string;
  event_type: EventType;
  category: string;
  short_description?: string;
  description: string;
  cover_url?: string;
  organization_id?: string | null;
  start_time: string;
  end_time: string;
  timezone?: string;
  format: EventFormat;
  venue_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  online_meeting_url?: string;
  online_meeting_platform?: string;
  price?: number;
  currency?: string;
  is_free?: boolean;
  capacity?: number | null;
  cme_credits?: number;
  cme_accreditation_body?: string;
  certificate_enabled?: boolean;
  requirements?: string[];
  tags?: string[];
  speakers?: Omit<EventSpeaker, "id" | "event_id">[];
  agenda?: Omit<EventAgendaItem, "id" | "event_id">[];
  submit_for_review?: boolean;
}

export interface EventFilterParams {
  search?: string;
  event_type?: string;
  category?: string;
  format?: string;
  city?: string;
  is_free?: boolean;
  timeframe?: "upcoming" | "past" | "this_week" | "this_month";
  page?: number;
  limit?: number;
  organizer_id?: string;
}
