# 🚀 Quick Start Guide - Premium Design System

## Get Started in 3 Steps

### 1. Import Components

```tsx
// Landing Page
import {
  HeroSection,
  FeaturedServices,
  FeatureHighlights,
} from "@/components/landing";

// Booking Management
import { BookingCard } from "@/components/booking/BookingCard";

// Utilities
import { premiumStyles } from "@/lib/premium-styles";
```

### 2. Use in Your Pages

```tsx
// app/page.tsx - Landing Page
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedServices services={yourServices} />
      <FeatureHighlights />
    </main>
  );
}
```

```tsx
// app/bookings/page.tsx - Booking Management
export default function BookingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Your Bookings</h1>

      <div className="mt-8 space-y-6">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            {...booking}
            onViewDetails={() => handleView(booking.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. Apply Premium Styles

```tsx
// Custom components with premium styling
import { premiumStyles } from "@/lib/premium-styles";

function CustomCard() {
  return (
    <div className={premiumStyles.cards.full}>
      <h2 className={premiumStyles.typography.heading2}>Your Title</h2>
      <p className={premiumStyles.typography.body}>Your description here...</p>
      <button className={premiumStyles.buttons.primary}>Call to Action</button>
    </div>
  );
}
```

## ✨ Common Patterns

### Premium Card

```tsx
<div className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)]">
  {/* Your content */}
</div>
```

### Rounded Button

```tsx
<button className="rounded-full bg-primary px-6 py-3 font-semibold shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]">
  Click Me
</button>
```

### Status Badge

```tsx
<span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-700">
  Confirmed
</span>
```

### Label Text

```tsx
<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
  Section Label
</p>
```

## 🎨 Booking Statuses

```tsx
// Status definitions
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

// Usage
<BookingCard
  status="confirmed" // emerald green
  status="pending" // amber yellow
  status="completed" // blue
  status="cancelled" // gray
  {...otherProps}
/>;
```

## 📱 Responsive Grid

```tsx
// 2 columns on tablet, 4 on desktop
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// 3 columns
<div className="grid gap-6 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## 🎬 Animations

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Fade in with delay
<div
  className="animate-fade-in"
  style={{ animationDelay: "80ms" }}
>
  Content
</div>

// Float soft
<div className="float-soft">Floating card</div>

// Zoom in
<div className="animate-zoom-in">Hero image</div>
```

## 🔧 Customization

### Change Primary Color

Update your Tailwind config or CSS variables:

```css
/* globals.css */
:root {
  --primary: your-color-hue your-color-saturation your-color-lightness;
}
```

### Adjust Shadows

```tsx
// Light shadow
className = "shadow-[0_8px_30px_rgba(0,0,0,0.08)]";

// Medium shadow
className = "shadow-[0_18px_45px_rgba(6,10,22,0.12)]";

// Primary glow
className = "shadow-[0_12px_30px_rgba(91,90,247,0.35)]";
```

### Custom Blur Effect

```tsx
<div className="backdrop-blur-sm">Content with blur background</div>
```

## 📚 Learn More

- **Full Documentation**: [`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- **Implementation Summary**: [`docs/IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md)
- **Example Page**: Visit `/examples/bookings` to see live demos

## 🆘 Need Help?

Common issues and solutions:

**Q: Buttons not showing hover effects?**  
A: Make sure you have the `transition` and `duration-300` classes.

**Q: Backdrop blur not working?**  
A: Check browser support. Use fallback: `bg-card/80 backdrop-blur-sm`

**Q: Cards not rounded?**  
A: Use `rounded-2xl`, `rounded-3xl`, or `rounded-full` for maximum effect.

**Q: Colors not matching reference?**  
A: Ensure you're using the `/60` or `/80` opacity modifiers: `border-border/60`, `bg-card/80`

## ✅ Checklist

Before launching:

- [ ] All components imported correctly
- [ ] Services data connected to FeaturedServices
- [ ] Booking status logic implemented
- [ ] Images optimized and loading
- [ ] Mobile responsive tested
- [ ] Hover effects working
- [ ] Accessibility checked (keyboard nav, contrast)
- [ ] Performance optimized (lazy loading, etc.)

---

**You're all set!** Start building your premium booking experience. 🎉
