# Appointment Booking System

A full-stack appointment booking platform built with Next.js, FastAPI, and Supabase.

## Features

### For Customers
- Browse available services and book appointments
- Real-time availability checking
- Secure payment processing with ABA Payway
- Email/SMS notifications
- Booking management dashboard
- Review and rating system

### For Staff
- Personal dashboard with daily schedule
- View upcoming appointments
- Manage availability (weekly schedule and exceptions)
- Track earnings and performance

### For Administrators
- Complete analytics dashboard with charts
- Service management (CRUD operations)
- Staff management
- Booking overview
- Revenue tracking
- User management

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Date Handling**: date-fns

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with Supabase
- **ORM**: SQLAlchemy
- **Authentication**: Supabase JWT
- **Payment**: ABA Payway (Mock Integration)

## Project Structure

```
.
├── app/                          # Next.js app directory
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # Customer dashboard
│   ├── staff/                   # Staff dashboard & availability
│   ├── admin/                   # Admin dashboard & management
│   ├── services/                # Service browsing
│   ├── book/                    # Booking flow
│   ├── payment/                 # Payment processing
│   └── booking-confirmed/       # Confirmation page
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── auth/                    # Auth-related components
│   ├── booking/                 # Booking form components
│   ├── payment/                 # Payment components
│   ├── staff/                   # Staff dashboard components
│   └── admin/                   # Admin dashboard components
│
├── lib/                         # Utilities and configuration
│   ├── supabase/               # Supabase client setup
│   ├── types/                  # TypeScript types
│   └── utils/                  # Helper functions
│
├── backend/                     # FastAPI backend
│   └── app/
│       ├── api/                # API endpoints
│       ├── core/               # Configuration
│       └── models/             # Data models
│
└── scripts/                     # Database setup scripts
    ├── 001_create_tables.sql
    ├── 002_enable_rls.sql
    ├── 003_create_profile_trigger.sql
    └── 004_seed_data.sql
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (via Supabase)
- Supabase Account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Create a `backend/.env` file:

```env
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=["http://localhost:3000"]
```

### Installation

1. **Install Frontend Dependencies**
```bash
npm install
```

2. **Install Backend Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Setup Database**
   - Run the SQL scripts in the `scripts/` directory in order
   - These can be executed directly from the v0 interface or via Supabase

4. **Start the Development Servers**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
uvicorn app.main:app --reload
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Schema

The system uses 14 main tables:

- **user_profiles**: Extended user information with roles
- **services**: Service offerings
- **staff_services**: Staff-to-service assignments
- **availability_rules**: Weekly availability patterns
- **availability_exceptions**: Special dates (holidays, etc.)
- **customers**: Customer records
- **bookings**: Appointment bookings
- **booking_changes**: Booking modification history
- **booking_logs**: Audit trail
- **payments**: Payment records
- **refunds**: Refund tracking
- **notifications**: Email/SMS notification log
- **waitlist**: Waitlist management
- **reviews**: Customer reviews and ratings

All tables have Row Level Security (RLS) enabled for data protection.

## API Endpoints

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/{id}` - Update service (Admin)
- `DELETE /api/services/{id}` - Delete service (Admin)

### Availability
- `GET /api/availability/slots` - Get available time slots
- `POST /api/availability/rules` - Create availability rule
- `GET /api/availability/rules/{staff_id}` - Get staff rules
- `POST /api/availability/exceptions` - Create exception

### Bookings
- `GET /api/bookings` - List bookings (with filters)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/{id}/confirm` - Confirm payment
- `POST /api/payments/{id}/refund` - Process refund

### Analytics
- `GET /api/analytics/bookings/stats` - Booking statistics
- `GET /api/analytics/services/stats` - Service performance
- `GET /api/analytics/staff/stats` - Staff performance
- `GET /api/analytics/daily/stats` - Daily statistics

## Authentication & Authorization

The system uses Supabase Auth with three user roles:

- **Customer**: Can browse services and book appointments
- **Staff**: Can view their schedule and manage availability
- **Admin**: Full system access including analytics and configuration

Role-based access is enforced through:
1. Supabase RLS policies (database level)
2. Middleware route protection (application level)
3. API authorization checks (API level)

## Payment Integration

The system includes ABA Payway integration (mocked for development):

- Payment intent creation
- Secure payment processing
- Deposit and full payment support
- Refund handling
- Transaction history

For production, replace the mock implementation in `backend/app/api/payments.py` with actual ABA Payway API calls.

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy

### Backend (Railway/Render/DigitalOcean)
1. Build the Docker image
2. Deploy to your preferred platform
3. Set environment variables

### Database (Supabase)
- Already hosted on Supabase
- Run production migrations
- Configure production RLS policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact support at support@appointbook.com

## Important Setup Notes

### Database Setup Required

**The database tables have not been created yet.** You must create them before the application will work.

You have two options:

#### Option 1: Use v0's SQL Execution (Recommended)
The SQL scripts in the `scripts/` directory can be executed directly from v0. Ask v0 to run:
- `scripts/001_create_tables.sql` - Creates all database tables
- `scripts/002_enable_rls.sql` - Enables Row Level Security
- `scripts/003_create_profile_trigger.sql` - Creates auto-profile trigger
- `scripts/004_seed_data.sql` - Adds sample data (optional)

#### Option 2: Manual Setup via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each script file in order
4. Execute each script

### Backend API Setup

**The backend API must be running for the app to work.** 

The frontend uses Supabase ONLY for authentication. All other data operations go through the FastAPI backend.

To start the backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables

You need to set the following environment variable in the **Vars section** of the v0 sidebar:

- `NEXT_PUBLIC_API_URL` - The URL of your FastAPI backend (default: `http://localhost:8000`)

Without this, the frontend cannot communicate with the backend for user profiles and booking data.

## Architecture Overview

```
┌─────────────┐
│   Next.js   │ ──── Auth Only ───> ┌──────────┐
│  Frontend   │                      │ Supabase │
│             │                      │   Auth   │
└─────────────┘                      └──────────┘
      │
      │ All Data Operations
      ▼
┌─────────────┐
│   FastAPI   │
│   Backend   │
└─────────────┘
      │
      ▼
┌─────────────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

**Data Flow:**
1. User signs up/logs in → Supabase Auth handles it
2. After auth, user profile created → FastAPI creates record in PostgreSQL
3. All bookings, services, payments → FastAPI + PostgreSQL
4. Frontend fetches user profile → FastAPI endpoint, NOT Supabase tables
