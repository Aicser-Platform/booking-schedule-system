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
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  buffer_minutes INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff services (many-to-many)
CREATE TABLE IF NOT EXISTS public.staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
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
  type VARCHAR(30) NOT NULL CHECK (type IN ('confirmation', 'reminder', 'cancellation', 'feedback')),
  recipient VARCHAR(150) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
