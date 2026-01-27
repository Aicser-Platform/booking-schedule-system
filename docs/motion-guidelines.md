# Motion Guidelines: AICSER Booking System

These guidelines aim for motion that feels calm, fast, and functional (similar to YouTube): subtle feedback, no theatrics.

## Core Principles
- Prefer transform and opacity for GPU-friendly motion.
- Keep motion short (roughly 150–240ms).
- Avoid gradients, parallax, and bouncy motion.
- Always respect reduced motion preferences.

## Design Tokens
Defined in `app/globals.css`.

- Easing: `--motion-ease-standard: cubic-bezier(0.2, 0, 0, 1)`
- Standard: `--motion-duration-standard: 180ms`
- Press: `--motion-duration-press: 100ms`
- Overlay: `--motion-duration-overlay: 220ms`
- Page: `--motion-duration-page: 180ms`
- Hover distance: `--motion-distance-hover: 2px`
- Overlay distance: `--motion-distance-overlay: 8px`
- Press scale: `--motion-press-scale: 0.98`

## Motion Rules
- Standard transitions: 150–200ms using the standard easing.
- Press feedback: 80–120ms with a scale of 0.98.
- Card hover: translateY(-2px) plus a subtle shadow increase.
- Menus, modals, drawers: fade plus a small slide (6–12px) over 180–240ms.
- Page content: fade only. No large slides or dramatic transitions.

## Utility Classes
Implemented in `app/globals.css`.

- `motion-standard`
- `motion-press`
- `motion-card`
- `motion-surface`
- `motion-overlay`
- `motion-page`

## Reduced Motion
Reduced motion is handled in two layers:

- CSS: `@media (prefers-reduced-motion: reduce)` reduces durations to near-zero and disables movement.
- JS: `useReducedMotion` and `useScrollAnimation` skip motion when reduced motion is enabled.

## Recommended Usage
- Buttons and compact controls: `motion-standard` plus press feedback.
- Interactive cards: `motion-card`.
- Popovers, dropdowns, sheets, tooltips: `motion-surface`.
- Overlays and backdrops: `motion-overlay`.
- Top-level page containers: `motion-page`.

