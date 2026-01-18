-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles
CREATE TABLE IF NOT EXISTS public.roles (
  name VARCHAR(30) PRIMARY KEY,
  description TEXT,
  is_unique BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  code VARCHAR(80) PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions (many-to-many)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_name VARCHAR(30) REFERENCES public.roles(name) ON DELETE CASCADE,
  permission_code VARCHAR(80) REFERENCES public.permissions(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (role_name, permission_code)
);

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(150) NOT NULL UNIQUE,
  full_name VARCHAR(150),
  phone VARCHAR(50),
  avatar_url VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  role VARCHAR(30) NOT NULL DEFAULT 'customer' REFERENCES public.roles(name),
  is_active BOOLEAN DEFAULT TRUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);

-- Ensure only one admin and one superadmin
CREATE UNIQUE INDEX IF NOT EXISTS uniq_users_admin_role
  ON public.users(role)
  WHERE role = 'admin';
CREATE UNIQUE INDEX IF NOT EXISTS uniq_users_superadmin_role
  ON public.users(role)
  WHERE role = 'superadmin';

-- Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  public_name VARCHAR(150),
  internal_name VARCHAR(150),
  category VARCHAR(120),
  tags TEXT[],
  description TEXT,
  inclusions TEXT,
  prep_notes TEXT,
  image_url VARCHAR(255),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  buffer_minutes INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  paused_from TIMESTAMP WITH TIME ZONE,
  paused_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paused_from TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS paused_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS public_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS internal_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS category VARCHAR(120),
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS inclusions TEXT,
  ADD COLUMN IF NOT EXISTS prep_notes TEXT;

-- Staff services (many-to-many)
CREATE TABLE IF NOT EXISTS public.staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  price_override DECIMAL(10, 2),
  deposit_override DECIMAL(10, 2),
  duration_override INTEGER,
  buffer_override INTEGER,
  capacity_override INTEGER,
  is_bookable BOOLEAN DEFAULT TRUE,
  is_temporarily_unavailable BOOLEAN DEFAULT FALSE,
  admin_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

ALTER TABLE public.staff_services
  ADD COLUMN IF NOT EXISTS price_override DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS deposit_override DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS duration_override INTEGER,
  ADD COLUMN IF NOT EXISTS buffer_override INTEGER,
  ADD COLUMN IF NOT EXISTS capacity_override INTEGER,
  ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_temporarily_unavailable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT FALSE;

-- Availability rules
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability exceptions
CREATE TABLE IF NOT EXISTS public.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT FALSE,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff weekly schedules
CREATE TABLE IF NOT EXISTS public.staff_weekly_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  effective_from DATE,
  effective_to DATE,
  is_default BOOLEAN DEFAULT FALSE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working blocks per weekday
CREATE TABLE IF NOT EXISTS public.staff_work_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES public.staff_weekly_schedules(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time_local TIME NOT NULL,
  end_time_local TIME NOT NULL
);

-- Break blocks per weekday
CREATE TABLE IF NOT EXISTS public.staff_break_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES public.staff_weekly_schedules(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time_local TIME NOT NULL,
  end_time_local TIME NOT NULL
);

-- Staff availability exceptions (UTC)
CREATE TABLE IF NOT EXISTS public.staff_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('time_off', 'blocked_time', 'extra_availability', 'override_day')),
  start_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  end_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  recurring_rule TEXT,
  reason VARCHAR(255),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking holds (temporary reservations)
CREATE TABLE IF NOT EXISTS public.booking_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  start_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  end_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff service overrides
CREATE TABLE IF NOT EXISTS public.staff_service_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  price_override DECIMAL(10, 2),
  deposit_override DECIMAL(10, 2),
  duration_override INTEGER,
  buffer_override INTEGER,
  capacity_override INTEGER,
  is_bookable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  timezone VARCHAR(50) DEFAULT 'UTC',
  notes TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  start_time_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time_utc TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  booking_source VARCHAR(30) DEFAULT 'web'
    CHECK (booking_source IN ('web', 'social', 'admin', 'api')),
  customer_timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking changes
CREATE TABLE IF NOT EXISTS public.booking_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_start_time TIMESTAMP WITH TIME ZONE,
  new_start_time TIMESTAMP WITH TIME ZONE,
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('reschedule', 'cancel', 'status_update')),
  changed_by VARCHAR(30),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking logs
CREATE TABLE IF NOT EXISTS public.booking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'aba_payway',
  provider_reference VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  provider_refund_id VARCHAR(255),
  status VARCHAR(30) DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms')),
  type VARCHAR(30) NOT NULL CHECK (
    type IN (
      'confirmation',
      'reminder',
      'cancellation',
      'feedback',
      'schedule_change',
      'schedule_approved',
      'schedule_rejected'
    )
  ),
  recipient VARCHAR(150) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check CHECK (
    type IN (
      'confirmation',
      'reminder',
      'cancellation',
      'feedback',
      'schedule_change',
      'schedule_approved',
      'schedule_rejected'
    )
  );

-- Waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  preferred_date DATE,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'notified', 'booked', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule change requests (approval workflow)
CREATE TABLE IF NOT EXISTS public.schedule_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  payload JSONB NOT NULL,
  reason TEXT,
  review_note TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_services_admin ON public.services(admin_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON public.staff_services(service_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_staff ON public.availability_rules(staff_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_staff ON public.availability_exceptions(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON public.bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time_utc);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_staff ON public.schedule_change_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_status ON public.schedule_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_weekly_schedules_staff ON public.staff_weekly_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_weekly_schedules_location ON public.staff_weekly_schedules(location_id);
CREATE INDEX IF NOT EXISTS idx_staff_work_blocks_schedule ON public.staff_work_blocks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_break_blocks_schedule ON public.staff_break_blocks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_exceptions_staff ON public.staff_exceptions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_exceptions_start ON public.staff_exceptions(start_utc);
CREATE INDEX IF NOT EXISTS idx_booking_holds_staff ON public.booking_holds(staff_id);
CREATE INDEX IF NOT EXISTS idx_booking_holds_expires ON public.booking_holds(expires_at_utc);
CREATE INDEX IF NOT EXISTS idx_staff_service_overrides_staff ON public.staff_service_overrides(staff_id);
