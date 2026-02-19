-- Core schema (auth + services + staff + availability)
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
  email_verified BOOLEAN DEFAULT TRUE,
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

-- Email verification tokens
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passwordless magic link tokens
CREATE TABLE IF NOT EXISTS public.magic_link_tokens (
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
  image_urls TEXT[],
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

-- Service operating schedules (service-level availability)
CREATE TABLE IF NOT EXISTS public.service_operating_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID UNIQUE REFERENCES public.services(id) ON DELETE CASCADE,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('daily', 'weekly', 'monthly')),
  open_time TIME,
  close_time TIME,
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service operating rules (weekly or monthly patterns)
CREATE TABLE IF NOT EXISTS public.service_operating_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID REFERENCES public.service_operating_schedules(id) ON DELETE CASCADE,
  rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('weekly', 'monthly_day', 'monthly_nth_weekday')),
  weekday INTEGER CHECK (weekday BETWEEN 0 AND 6),
  month_day INTEGER CHECK (month_day BETWEEN 1 AND 31),
  nth INTEGER,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service operating exceptions (open/close overrides)
CREATE TABLE IF NOT EXISTS public.service_operating_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_open BOOLEAN DEFAULT FALSE,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
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
  max_slots_per_day INTEGER,
  max_bookings_per_day INTEGER,
  max_bookings_per_customer INTEGER,
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
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(location_id);
CREATE INDEX IF NOT EXISTS idx_services_admin ON public.services(admin_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON public.staff_services(service_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_staff ON public.availability_rules(staff_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_staff ON public.availability_exceptions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_weekly_schedules_staff ON public.staff_weekly_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_weekly_schedules_location ON public.staff_weekly_schedules(location_id);
CREATE INDEX IF NOT EXISTS idx_staff_work_blocks_schedule ON public.staff_work_blocks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_break_blocks_schedule ON public.staff_break_blocks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_staff_exceptions_staff ON public.staff_exceptions(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_exceptions_start ON public.staff_exceptions(start_utc);
CREATE INDEX IF NOT EXISTS idx_booking_holds_staff ON public.booking_holds(staff_id);
CREATE INDEX IF NOT EXISTS idx_booking_holds_expires ON public.booking_holds(expires_at_utc);
CREATE INDEX IF NOT EXISTS idx_staff_service_overrides_staff ON public.staff_service_overrides(staff_id);
CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_staff ON public.schedule_change_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_status ON public.schedule_change_requests(status);
