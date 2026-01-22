# Premium Landing Page Design System

## Overview

This design system implements a modern, calm, and premium aesthetic inspired by high-end booking platforms. It features soft gradients, gentle micro-interactions, and a refined color palette.

## Design Principles

### 1. **Soft & Minimal Aesthetic**

- Subtle gradients with blur effects
- Rounded corners (2xl, 3xl, full)
- Soft borders (`border-border/60`)
- Gentle shadows (`shadow-[0_8px_30px_rgba(0,0,0,0.08)]`)

### 2. **Premium Micro-Interactions**

- Hover effects with `-translate-y-1` or `-translate-y-0.5`
- Duration: `duration-300`
- Shadow elevation on hover
- Border color transitions

### 3. **Typography**

- Uppercase labels with `tracking-[0.3em]` or `tracking-[0.4em]`
- Semibold headings (`font-semibold`)
- Muted text for secondary content

### 4. **Color System**

- Primary: Used for CTAs and accents
- Muted: For secondary text and backgrounds
- Soft backgrounds: `bg-card/80` with `backdrop-blur-sm`

## Component Library

### HeroSection

**Location:** `components/landing/HeroSection.tsx`

Premium hero with stats cards, live preview panel, and trust indicators.

```tsx
import { HeroSection } from "@/components/landing/HeroSection";

<HeroSection />;
```

**Features:**

- Subtle gradient background with blur effects
- Stats grid with hover animations
- Live schedule preview card
- Trust indicators with icons

### ServiceCard

**Location:** `components/landing/ServiceCard.tsx`

Modern service card with soft borders and premium hover effects.

```tsx
import { ServiceCard } from "@/components/landing/ServiceCard";

<ServiceCard service={serviceData} />;
```

**Features:**

- Soft border and backdrop blur
- Image zoom on hover (scale-110)
- Status badges with custom colors
- Rounded-full CTA button

### BookingCard

**Location:** `components/booking/BookingCard.tsx`

Premium booking card with status badges and color coding.

```tsx
import { BookingCard } from "@/components/booking/BookingCard";

<BookingCard
  id="booking-123"
  serviceName="Hair Styling"
  date="Jan 24, 2026"
  time="10:30 AM"
  price={75}
  status="confirmed"
  onViewDetails={() => console.log("View details")}
/>;
```

**Statuses:**

- `pending`: Amber colors
- `confirmed`: Emerald colors
- `completed`: Blue colors
- `cancelled`: Gray colors

**Compact Version:**

```tsx
import { BookingCardCompact } from "@/components/booking/BookingCard";

<BookingCardCompact
  serviceName="Massage Therapy"
  date="Jan 24, 2026"
  time="2:00 PM"
  price={120}
  status="pending"
  onViewDetails={() => {}}
/>;
```

### FeaturedServices

**Location:** `components/landing/FeaturedServices.tsx`

Showcase featured services with soft background.

```tsx
import { FeaturedServices } from "@/components/landing/FeaturedServices";

<FeaturedServices services={servicesList} />;
```

**Features:**

- Decorative gradient background
- Staggered fade-in animations
- Centered header with refined typography

### FeatureHighlights

**Location:** `components/landing/FeatureHighlights.tsx`

Grid-based feature cards with icons and descriptions.

```tsx
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";

<FeatureHighlights />;
```

**Features:**

- 12-column responsive grid
- Icon-first design with color accents
- Hover elevation effects

## Styling Patterns

### Buttons

```tsx
// Primary CTA
<Button className="rounded-full bg-primary shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]">
  Get Started
</Button>

// Secondary
<Button variant="outline" className="rounded-full border-border/60 bg-background/60 transition duration-300 hover:-translate-y-0.5 hover:bg-muted/60">
  Learn More
</Button>
```

### Cards

```tsx
<div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)]">
  {/* Card content */}
</div>
```

### Badges

```tsx
<span className="rounded-full border border-border/60 bg-primary/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
  Featured
</span>
```

### Background Decorations

```tsx
<div className="pointer-events-none absolute inset-0">
  <div className="absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary/10 blur-[120px]" />
</div>
```

## Animations

### Fade In

```css
.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}
```

Usage:

```tsx
<div className="animate-fade-in" style={{ animationDelay: "80ms" }}>
  {/* Content */}
</div>
```

### Float Soft

```css
.float-soft {
  animation: floatSoft 6s ease-in-out infinite;
}
```

### Zoom In

```css
.animate-zoom-in {
  animation: zoomIn 1.5s ease-out 0.4s both;
}
```

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Minimum 4.5:1 contrast ratio for text
- Keyboard navigation support
- Focus indicators
- Semantic HTML
- ARIA labels where appropriate

## Mobile-First

All components are responsive with:

- Mobile: Single column
- Tablet (sm): 2 columns
- Desktop (lg): 3-4 columns

## Color Palette

```css
/* Soft borders */
border-border/60

/* Card backgrounds */
bg-card/80 backdrop-blur-sm

/* Muted text */
text-muted-foreground

/* Primary accents */
bg-primary/15 text-primary
```

## Example Integration

```tsx
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedServices } from "@/components/landing/FeaturedServices";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturedServices services={services} />
      <FeatureHighlights />
    </main>
  );
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- GPU-accelerated transforms
- Optimized backdrop blur usage
- Lazy-loaded images
- Minimal re-renders with React best practices
