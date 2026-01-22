# Component Architecture

## 📊 Component Tree

```
booking-schedule-system/
│
├── components/
│   ├── landing/                        # Landing page components
│   │   ├── HeroSection.tsx            ✨ UPDATED - Premium hero
│   │   ├── ServiceCard.tsx            ✨ UPDATED - Refined card design
│   │   ├── FeaturedServices.tsx       ✨ UPDATED - Soft background
│   │   ├── FeatureHighlights.tsx      🆕 NEW - Icon-based features
│   │   ├── Navbar.tsx                 (existing)
│   │   ├── Footer.tsx                 (existing)
│   │   └── index.ts                   ✨ UPDATED - Export added
│   │
│   ├── booking/                        # Booking management
│   │   ├── BookingCard.tsx            🆕 NEW - Premium booking card
│   │   │   ├── BookingCard           (Full variant)
│   │   │   └── BookingCardCompact    (Compact variant)
│   │   ├── booking-form.tsx           (existing)
│   │   └── landing-hero.tsx           (existing)
│   │
│   └── ui/                             # Base UI components
│       ├── button.tsx                  (shadcn/ui)
│       ├── badge.tsx                   (shadcn/ui)
│       ├── dropdown-menu.tsx           (shadcn/ui)
│       └── ...
│
├── lib/
│   ├── premium-styles.ts              🆕 NEW - Style utilities
│   ├── utils.ts                       (existing)
│   └── types/
│       └── landing.ts                  (existing types)
│
├── app/
│   ├── page.tsx                       (main landing page)
│   ├── globals.css                    ✨ UPDATED - Animations added
│   ├── bookings/page.tsx              (booking list page)
│   └── examples/
│       └── bookings/page.tsx          🆕 NEW - Demo page
│
└── docs/
    ├── DESIGN_SYSTEM.md               🆕 NEW - Complete guide
    ├── IMPLEMENTATION_SUMMARY.md       🆕 NEW - What was built
    └── QUICK_START.md                  🆕 NEW - Quick reference
```

## 🎨 Component Relationships

### Landing Page Flow

```
HomePage
  └─ HeroSection
      ├─ Stats Cards (3)
      ├─ Schedule Preview Card
      └─ Trust Indicators (3)

  └─ FeaturedServices
      └─ ServiceCard[] (4)
          ├─ Image
          ├─ Badges
          ├─ Content
          └─ CTA Button

  └─ FeatureHighlights
      └─ Feature Cards (6)
          ├─ Icon
          ├─ Title
          └─ Description
```

### Booking Management Flow

```
BookingsPage
  └─ BookingCard[]
      ├─ Status Badge
      ├─ Service Image
      ├─ Details Grid
      │   ├─ Date
      │   ├─ Time
      │   └─ Price
      ├─ Actions Menu
      └─ CTA Buttons

  └─ BookingCardCompact[]
      ├─ Service Name
      ├─ Status Badge
      └─ Quick Details
```

## 🔌 Data Flow

### ServiceCard Props

```typescript
interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    publicName?: string;
    description?: string;
    category?: string;
    tags?: string[];
    price: number;
    durationMinutes: number;
    depositAmount?: number;
    imageUrl?: string;
    imageUrls?: string[];
  };
}
```

### BookingCard Props

```typescript
interface BookingCardProps {
  id: string;
  serviceName: string;
  serviceImage?: string;
  date: string;
  time: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  location?: string;
  providerName?: string;
  onBook?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onViewDetails?: () => void;
}
```

## 🎭 Style System

### Base Styles (from `premium-styles.ts`)

```typescript
premiumStyles
  ├─ cards
  │   ├─ base
  │   ├─ hover
  │   ├─ full
  │   └─ compact
  │
  ├─ buttons
  │   ├─ primary
  │   ├─ secondary
  │   └─ ghost
  │
  ├─ badges
  │   ├─ default
  │   ├─ primary
  │   ├─ success
  │   ├─ warning
  │   └─ danger
  │
  ├─ typography
  │   ├─ heading1-3
  │   ├─ label
  │   └─ body
  │
  └─ status
      ├─ pending
      ├─ confirmed
      ├─ completed
      └─ cancelled
```

## 🎬 Animation System

### Available Animations (from `globals.css`)

```css
.animate-fade-in      /* Fade in from bottom */
.animate-zoom-in      /* Scale up with fade */
.float-soft           /* Gentle floating */
```

### Usage Pattern

```tsx
// Single element
<div className="animate-fade-in">

// With delay
<div
  className="animate-fade-in"
  style={{ animationDelay: "80ms" }}
>

// Staggered list
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${i * 80}ms` }}
  />
))}
```

## 🎯 Design Tokens

### Spacing

```
gap-3  = 0.75rem  (12px)
gap-4  = 1rem     (16px)
gap-6  = 1.5rem   (24px)
gap-8  = 2rem     (32px)
p-6    = 1.5rem   (24px padding)
```

### Border Radius

```
rounded-2xl   = 1rem     (16px)
rounded-3xl   = 1.5rem   (24px)
rounded-full  = 9999px
```

### Opacity

```
/60  = 60% opacity
/70  = 70% opacity
/80  = 80% opacity
```

### Tracking (Letter Spacing)

```
tracking-[0.3em]  = Small labels
tracking-[0.4em]  = Section headers
```

## 🔄 State Management Pattern

### Booking Status Colors

```typescript
pending    → Amber   (bg-amber-50, text-amber-700)
confirmed  → Emerald (bg-emerald-50, text-emerald-700)
completed  → Blue    (bg-blue-50, text-blue-700)
cancelled  → Gray    (bg-gray-50, text-gray-600)
```

### Hover States

```css
Default:  border-border/60, bg-card/80
Hover:    border-border, bg-card/90, -translate-y-1
```

## 📱 Responsive Breakpoints

```css
sm:   640px   /* Tablet portrait */
md:   768px   /* Tablet landscape */
lg:   1024px  /* Desktop */
xl:   1280px  /* Large desktop */
```

### Grid Patterns

```tsx
// Mobile → 2 col → 4 col
grid sm:grid-cols-2 lg:grid-cols-4

// Mobile → 3 col
grid lg:grid-cols-3

// Asymmetric
grid lg:grid-cols-[1.1fr_0.9fr]
```

## 🚀 Performance Optimizations

### Implemented

- ✅ GPU-accelerated transforms (translateZ)
- ✅ will-change on hover only
- ✅ Lazy loading images
- ✅ Backdrop blur used sparingly
- ✅ Optimized animation timing

### CSS Properties Used

```css
/* GPU accelerated */
transform: translateY(), scale()
opacity

/* Avoid reflow */
NOT using: width, height, margin changes
```

---

This architecture supports scalability, maintainability, and performance while delivering a premium user experience.
