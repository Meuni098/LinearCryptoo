---
name: Mathematical Observatory
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393d'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#292a2d'
  surface-container-highest: '#333538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#c3c6d0'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#8d919a'
  outline-variant: '#43474f'
  surface-tint: '#a9c8fc'
  primary: '#a9c8fc'
  on-primary: '#09305c'
  primary-container: '#0f3460'
  on-primary-container: '#7f9dd0'
  inverse-primary: '#405f8e'
  secondary: '#ffb2b7'
  on-secondary: '#67001c'
  secondary-container: '#9e0030'
  on-secondary-container: '#ffa7ae'
  tertiary: '#4cd6fb'
  on-tertiary: '#003642'
  tertiary-container: '#003946'
  on-tertiary-container: '#00aacc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a9c8fc'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#274774'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000e'
  on-secondary-fixed-variant: '#91002b'
  tertiary-fixed: '#b3ebff'
  tertiary-fixed-dim: '#4cd6fb'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5f'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#333538'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  h2:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  math-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
  math-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is built upon the "Mathematical Observatory" aesthetic—a visual framework that treats complex data and cryptographic proofs as celestial bodies viewed through a high-precision lens. The brand personality is rigorous, intellectual, and cinematic, evoking the feeling of a high-end research facility or a deep-space navigation deck.

The style merges **Minimalism** with subtle **Glassmorphism**. It relies on the tension between vast, dark voids (the background) and razor-sharp, illuminated data points. Every element serves a functional purpose, utilizing thin 1px borders and dot grids to imply a coordinate system where education meets exploration. The UI should never feel crowded; instead, it should feel like an infinite canvas of organized thought, where active elements emit a soft, radioactive glow to guide the user through the logic.

## Colors

The color palette is grounded in "Deep Space Navy" to minimize eye strain during long-form learning sessions. The hierarchy is established through three layers of blue-tinted darkness: the base background, the structural panels, and the elevated interactive surfaces.

Accents are used with mathematical intent. **Royal Blue** acts as the primary brand anchor for structural interactive elements. **Vibrant Coral-Red** is reserved exclusively for the "Active Step" in a sequence or a cryptographic process, creating a high-contrast focal point. **Cyan** provides positive reinforcement for success states and completed proofs, while **Golden Yellow** is utilized specifically for "Matrix Highlights"—drawing attention to specific variables or data nodes within a mathematical array.

## Typography

Typography in this design system balances technical character with high readability. **Space Grotesk** is utilized for headings; its geometric quirks reflect the "Mathematical Observatory" theme. All headings should be set with tight tracking to maintain a modern, cinematic appearance.

**Noto Sans** handles the heavy lifting for instructional text, providing a neutral and clear reading experience that contrasts against the more expressive headings. **JetBrains Mono** is the critical workhorse for all mathematical notation, code snippets, and UI labels. It ensures that variables, characters, and numbers are perfectly aligned and distinct, essential for cryptographic education.

## Layout & Spacing

The layout is governed by a **12-column fixed grid** centered on the screen, reflecting the "Observatory" lens. Spacing follows a strict 4px/8px baseline rhythm to maintain mathematical rigor. 

A subtle **dot grid overlay** (repeating every 24px) should be applied to the primary background to assist with visual alignment and reinforce the "canvas" feel. Margins between panels should be generous to allow the dark background to "breathe," ensuring that the complex mathematical content doesn't feel overwhelming. Use horizontal rules sparingly; prefer the 24px/40px whitespace intervals to define content blocks.

## Elevation & Depth

Depth is conveyed through **tonal layering and low-contrast outlines** rather than traditional drop shadows. 

1.  **Base Layer:** The deepest navy (#0D0D1A) serves as the infinite void.
2.  **Panel Layer:** Main content areas (#1A1A2E) sit immediately above the base, defined by a `1px solid rgba(255, 255, 255, 0.06)` border.
3.  **Elevated Layer:** Tooltips, modals, and pop-overs use the lightest navy (#16213E) with a slightly more opaque border (`0.1`).
4.  **Interactive Glow:** Active elements (like the Coral-Red step) do not use shadows but instead employ a "soft bloom"—a diffused outer glow of the same color (opacity 20%, blur 12px) to simulate a light source in the dark.

## Shapes

The shape language is "Soft Technical." We use a base corner radius of **4px (0.25rem)** for all standard UI elements like buttons, inputs, and small cards. This slight rounding prevents the interface from feeling "sharp" or aggressive, while remaining tight enough to look engineered and precise. Large containers or main panels may use **rounded-lg (0.5rem)** to subtly distinguish structural areas from functional components.

## Components

### Buttons & Inputs
Buttons feature a 1.5px stroke and a transparent background in their default state. The "Primary Action" button uses a solid Royal Blue fill. The "Active Step" button uses the Vibrant Coral-Red with the signature soft bloom effect. Inputs are dark (#1A1A2E) with 1px borders that brighten to Royal Blue on focus.

### Icons
All icons must be **outlined with a 1.5px stroke**. They should be sourced from a technical or geometric set (like Feather or Phosphor) to match the JetBrains Mono aesthetic.

### Mathematical Matrices
Data tables and matrices use the Golden Yellow highlight for specific cell focus. Cells are separated by the 1px `rgba(255,255,255,0.06)` border. Row headers use the JetBrains Mono label style.

### Chips & Tags
Chips are used for cryptographic tags (e.g., "AES-256", "Prime"). They feature a background of #16213E and no border, using small-caps Mono text to feel like metadata in a console.

### Progress Steppers
The stepper is a vital component for this design system. Completed steps are Cyan, the current active step is Coral-Red with a glow, and future steps are Secondary Text color with a dashed connecting line.