# Scroll Animations System

## Overview

The landing page uses a custom scroll animation hook that triggers animations when elements enter the viewport. This creates a smooth, engaging user experience as users scroll down the page.

## Implementation

### Hook: `useScrollAnimation`

Location: `hooks/use-scroll-animation.ts`

The hook uses the Intersection Observer API to detect when elements come into view.

**Features:**

- ✅ Configurable threshold (how much of element must be visible)
- ✅ Configurable root margin (offset for triggering)
- ✅ Trigger once option (animation plays only once)
- ✅ Automatic cleanup on unmount

**Usage:**

```tsx
const section = useScrollAnimation({ threshold: 0.2, triggerOnce: true });

<div
  ref={section.ref}
  className={`transition-all duration-700 ${
    section.isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
  }`}
>
  {/* Your content */}
</div>;
```

### Landing Page Implementation

Location: `app/page.tsx`

**Animated Sections:**

1. **Search and Filters** - Fades in from bottom
2. **Category Grid** - Fades in with 100ms delay
3. **Featured Services** - Fades in with 200ms delay
4. **Services Menu** - Fades in from bottom
5. **Trust Section** - Fades in from bottom
6. **How It Works** - Fades in with 100ms delay

**Animation Pattern:**

- Initial state: `translate-y-8 opacity-0` (element is below and invisible)
- Visible state: `translate-y-0 opacity-100` (element slides up and fades in)
- Duration: 700ms with ease-in-out timing
- Staggered delays: 0ms, 100ms, 200ms for sequential sections

## CSS Animations

Location: `app/globals.css`

### Available Keyframes:

1. **fadeIn** - Basic fade with small upward movement
2. **slideUp** - Fade in with larger upward movement (40px)
3. **scaleIn** - Fade in with scale effect
4. **fadeInLeft** - Fade in from left side
5. **fadeInRight** - Fade in from right side
6. **zoomIn** - Scale animation for images
7. **floatSoft** - Gentle floating effect (6s loop)

### Usage Examples:

```css
/* Basic fade */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}

/* Slide up */
.animate-slide-up {
  animation: slideUp 0.8s ease-out both;
}

/* Scale in */
.animate-scale-in {
  animation: scaleIn 0.6s ease-out both;
}

/* Directional fades */
.animate-fade-in-left {
  animation: fadeInLeft 0.7s ease-out both;
}
.animate-fade-in-right {
  animation: fadeInRight 0.7s ease-out both;
}
```

## Performance Considerations

### Why Intersection Observer?

- ✅ Native browser API (no external dependencies)
- ✅ Highly performant (runs on separate thread)
- ✅ Automatic cleanup (no memory leaks)
- ✅ Works with SSR/Next.js

### Best Practices:

1. **Threshold**: Use 0.1-0.2 for large sections, 0.3-0.5 for smaller elements
2. **Trigger Once**: Set to `true` for performance (default)
3. **Timing**: Use 700-1000ms durations for smooth animations
4. **Stagger**: Add 50-200ms delays between sequential elements

### Browser Support:

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Full support

## Customization

### Adding New Animations:

1. Define keyframe in `globals.css`:

```css
@keyframes myAnimation {
  from {
    /* start state */
  }
  to {
    /* end state */
  }
}
```

2. Use with scroll hook:

```tsx
const mySection = useScrollAnimation({ threshold: 0.2 });

<div
  ref={mySection.ref}
  className={mySection.isVisible ? "animate-my-animation" : "opacity-0"}
>
  Content
</div>;
```

### Adjusting Timing:

```tsx
// Faster animation
<div className="transition-all duration-300">

// Slower animation
<div className="transition-all duration-1000">

// Custom delay
<div className="transition-all duration-700 delay-500">
```

## Accessibility

- ✅ Respects `prefers-reduced-motion` media query
- ✅ Content is accessible without animations
- ✅ No layout shift during animation
- ✅ Keyboard navigation unaffected

## Future Enhancements

- [ ] Add parallax scrolling effects
- [ ] Implement horizontal scroll animations
- [ ] Add number counter animations for stats
- [ ] Create staggered grid animations
- [ ] Add page transition animations
