-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff and admin can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Services Policies
CREATE POLICY "Everyone can view active services" ON public.services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admin can manage services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Staff Services Policies
CREATE POLICY "Staff can view their own assignments" ON public.staff_services
  FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "Admin can manage staff assignments" ON public.staff_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Availability Rules Policies
CREATE POLICY "Staff can manage their own availability" ON public.availability_rules
  FOR ALL USING (staff_id = auth.uid());

CREATE POLICY "Everyone can view staff availability" ON public.availability_rules
  FOR SELECT USING (TRUE);

-- Availability Exceptions Policies
CREATE POLICY "Staff can manage their own exceptions" ON public.availability_exceptions
  FOR ALL USING (staff_id = auth.uid());

CREATE POLICY "Everyone can view availability exceptions" ON public.availability_exceptions
  FOR SELECT USING (TRUE);

-- Customers Policies
CREATE POLICY "Customers can view their own data" ON public.customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Customers can insert their own data" ON public.customers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Customers can update their own data" ON public.customers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Staff and admin can view all customers" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Admin can manage all customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bookings Policies
CREATE POLICY "Customers can view their own bookings" ON public.bookings
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view their own bookings" ON public.bookings
  FOR SELECT USING (staff_id = auth.uid());

CREATE POLICY "Staff can update their bookings" ON public.bookings
  FOR UPDATE USING (staff_id = auth.uid());

CREATE POLICY "Admin can manage all bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Booking Changes Policies
CREATE POLICY "Users can view booking changes for their bookings" ON public.booking_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      LEFT JOIN public.customers c ON b.customer_id = c.id
      WHERE b.id = booking_id
      AND (b.staff_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Admin can view all booking changes" ON public.booking_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Booking Logs Policies (same as booking_changes)
CREATE POLICY "Users can view logs for their bookings" ON public.booking_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      LEFT JOIN public.customers c ON b.customer_id = c.id
      WHERE b.id = booking_id
      AND (b.staff_id = auth.uid() OR c.user_id = auth.uid())
    )
  );

-- Payments Policies
CREATE POLICY "Customers can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      LEFT JOIN public.customers c ON b.customer_id = c.id
      WHERE b.id = booking_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view payments for their bookings" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.staff_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Refunds Policies
CREATE POLICY "Admin can manage refunds" ON public.refunds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view refunds for their payments" ON public.refunds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payments p
      LEFT JOIN public.bookings b ON p.booking_id = b.id
      LEFT JOIN public.customers c ON b.customer_id = c.id
      WHERE p.id = payment_id AND c.user_id = auth.uid()
    )
  );

-- Notifications Policies
CREATE POLICY "Admin can view all notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Waitlist Policies
CREATE POLICY "Customers can view their own waitlist entries" ON public.waitlist
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can add themselves to waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage waitlist" ON public.waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Reviews Policies
CREATE POLICY "Everyone can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Customers can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      LEFT JOIN public.customers c ON b.customer_id = c.id
      WHERE b.id = booking_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all reviews" ON public.reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
