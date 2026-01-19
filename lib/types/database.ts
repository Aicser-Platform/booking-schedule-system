export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  timezone: string;
  role: "customer" | "staff" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  admin_id: string | null;
  name: string;
  public_name?: string | null;
  internal_name?: string | null;
  category?: string | null;
  tags?: string[] | null;
  description: string | null;
  inclusions?: string | null;
  prep_notes?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  buffer_minutes: number;
  max_capacity: number;
  is_active: boolean;
  is_archived?: boolean;
  archived_at?: string | null;
  paused_from?: string | null;
  paused_until?: string | null;
  created_at: string;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  created_at: string;
}

export interface AvailabilityRule {
  id: string;
  staff_id: string;
  service_id: string | null;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  timezone: string;
  created_at: string;
}

export interface AvailabilityException {
  id: string;
  staff_id: string;
  service_id: string | null;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  timezone: string;
  notes: string | null;
  is_blocked: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  staff_id: string;
  customer_id: string;
  start_time_utc: string;
  end_time_utc: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
  payment_status: "pending" | "paid" | "refunded" | "failed";
  booking_source: "web" | "social" | "admin" | "api";
  customer_timezone: string;
  created_at: string;
}

export interface BookingChange {
  id: string;
  booking_id: string;
  old_start_time: string | null;
  new_start_time: string | null;
  change_type: "reschedule" | "cancel" | "status_update";
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  provider: string;
  provider_reference: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  booking_id: string;
  channel: "email" | "sms";
  type: "confirmation" | "reminder" | "cancellation" | "feedback";
  recipient: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
}

export interface Waitlist {
  id: string;
  service_id: string;
  customer_id: string;
  preferred_date: string;
  status: "active" | "notified" | "booked" | "expired";
  created_at: string;
}
