-- This script seeds the database with sample data for testing
-- Note: You need to create users through Supabase Auth first

-- Insert sample services (you'll need to replace the admin_id with actual user IDs)
INSERT INTO public.services (name, description, duration_minutes, price, deposit_amount, buffer_minutes, max_capacity, is_active)
VALUES
  ('Medical Consultation', '30-minute consultation with a doctor', 30, 50.00, 10.00, 10, 1, TRUE),
  ('Dental Checkup', 'General dental examination', 45, 75.00, 15.00, 15, 1, TRUE),
  ('Physical Therapy Session', 'One-on-one physical therapy', 60, 80.00, 20.00, 10, 1, TRUE),
  ('Hair Cut & Styling', 'Professional haircut and styling', 45, 40.00, 0.00, 15, 2, TRUE),
  ('Spa Massage', 'Relaxing full-body massage', 90, 120.00, 30.00, 15, 1, TRUE),
  ('Business Consultation', '60-minute business strategy session', 60, 150.00, 50.00, 15, 1, TRUE),
  ('Tutoring Session', 'One-on-one academic tutoring', 60, 45.00, 0.00, 10, 1, TRUE),
  ('Yoga Class', 'Group yoga session', 60, 25.00, 0.00, 10, 10, TRUE)
ON CONFLICT DO NOTHING;

-- Note: Additional seed data (staff assignments, availability, bookings) 
-- will need actual user IDs from Supabase Auth
-- These can be added after users are created through the application
