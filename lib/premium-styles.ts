/**
 * Premium Design System - Quick Reference
 *
 * This file contains reusable class name patterns for the premium design system
 */

export const premiumStyles = {
  // Card Styles
  cards: {
    base: "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm",
    hover:
      "transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)]",
    full: "rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/90 hover:shadow-[0_18px_45px_rgba(6,10,22,0.12)]",
    compact: "rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm",
    shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
  },

  // Button Styles
  buttons: {
    primary:
      "rounded-full bg-primary shadow-[0_12px_30px_rgba(91,90,247,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(91,90,247,0.4)]",
    secondary:
      "rounded-full border-border/60 bg-background/60 transition duration-300 hover:-translate-y-0.5 hover:bg-muted/60",
    ghost: "rounded-full transition duration-300 hover:-translate-y-0.5",
  },

  // Badge Styles
  badges: {
    default:
      "rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] backdrop-blur-sm",
    primary:
      "rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary backdrop-blur-sm",
    success:
      "rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-emerald-700",
    warning:
      "rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber-700",
    danger:
      "rounded-full border border-red-200/60 bg-red-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-red-700",
    info: "rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-blue-700",
  },

  // Typography
  typography: {
    heading1: "text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl",
    heading2: "text-3xl font-semibold sm:text-4xl",
    heading3: "text-xl font-semibold",
    label: "text-xs uppercase tracking-[0.3em] text-muted-foreground",
    labelLarge: "text-xs uppercase tracking-[0.4em] text-muted-foreground",
    body: "text-sm text-muted-foreground",
    bodyLarge: "text-base text-muted-foreground",
  },

  // Layout
  layout: {
    container: "mx-auto max-w-6xl px-6",
    section: "py-20",
    grid2: "grid gap-6 sm:grid-cols-2",
    grid3: "grid gap-6 lg:grid-cols-3",
    grid4: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
  },

  // Decorative Elements
  decorations: {
    gradientBlur: "pointer-events-none absolute rounded-full blur-[120px]",
    gradientBlurSmall: "pointer-events-none absolute rounded-full blur-[80px]",
  },

  // Animations
  animations: {
    fadeIn: "animate-fade-in",
    zoomIn: "animate-zoom-in",
    floatSoft: "float-soft",
    delay: (ms: number) => ({ animationDelay: `${ms}ms` }),
  },

  // Icon Containers
  iconContainers: {
    small: "flex h-10 w-10 items-center justify-center rounded-xl",
    medium: "flex h-12 w-12 items-center justify-center rounded-2xl",
    large: "flex h-14 w-14 items-center justify-center rounded-2xl",
  },

  // Status Colors
  status: {
    pending: {
      badge: "border-amber-200/60 bg-amber-50 text-amber-700",
      icon: "bg-amber-500/15 text-amber-600",
    },
    confirmed: {
      badge: "border-emerald-200/60 bg-emerald-50 text-emerald-700",
      icon: "bg-emerald-500/15 text-emerald-600",
    },
    completed: {
      badge: "border-blue-200/60 bg-blue-50 text-blue-700",
      icon: "bg-blue-500/15 text-blue-600",
    },
    cancelled: {
      badge: "border-gray-200/60 bg-gray-50 text-gray-600",
      icon: "bg-gray-500/15 text-gray-600",
    },
  },
};

/**
 * Usage Example:
 *
 * import { premiumStyles } from '@/lib/premium-styles';
 *
 * <div className={premiumStyles.cards.full}>
 *   <h2 className={premiumStyles.typography.heading2}>Title</h2>
 *   <p className={premiumStyles.typography.body}>Description</p>
 * </div>
 */

export type PremiumStyles = typeof premiumStyles;
