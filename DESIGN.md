---
name: Obsidian Neon
colors:
  surface: '#101416'
  surface-dim: '#101416'
  surface-bright: '#363a3c'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#181c1e'
  surface-container: '#1c2022'
  surface-container-high: '#272b2c'
  surface-container-highest: '#313537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#96d1d6'
  on-secondary: '#00363a'
  secondary-container: '#074f54'
  on-secondary-container: '#84bfc4'
  tertiary: '#f3f8fc'
  on-tertiary: '#2c3134'
  tertiary-container: '#d7dbdf'
  on-tertiary-container: '#5b6064'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#b1edf2'
  secondary-fixed-dim: '#96d1d6'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#074f54'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c2c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#42474b'
  background: '#101416'
  on-background: '#e0e3e5'
  surface-variant: '#313537'
typography:
  display-lg:
    fontFamily: Poppins
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Poppins
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Poppins
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-desktop: 40px
  container-padding-mobile: 20px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is centered on a "Black-out Tactical" aesthetic, designed for high-focus environments where immersion is paramount. It targets a sophisticated, tech-forward audience that values precision and premium craftsmanship.

The visual style merges **Dark Minimalism** with **Skeuomorphic Glassmorphism**. UI elements appear as physical, translucent glass slabs floating in a deep, pressurized void. The atmosphere is quiet and authoritative, punctuated by "Tube Light" neon accents that guide the eye toward critical actions. The emotional response should be one of intense focus, reliability, and high-end technical capability.

## Colors

The palette is anchored in a "Deep Space" near-black (`#020405`), infused with subtle blue undertones to prevent visual flatness. 

- **Primary (Neon Teal):** A high-vibrancy teal used exclusively for active states, critical data points, and "tube light" glow effects.
- **Secondary (Deep Petrol):** A muted, dark teal used for hover states and secondary interactive borders to maintain the tactical depth.
- **Surface (Obsidian):** The primary container color, slightly lifted from the background to allow for glassmorphism and inner shadows.
- **Typography:** Pure white (`#FFFFFF`) or high-contrast silver (`#E0E6ED`) is used to ensure legibility against the dark void.

## Typography

This design system utilizes **Poppins** for its geometric clarity and premium feel. Headlines use tighter tracking and heavier weights to command attention. For technical data and tactical labels, **JetBrains Mono** is introduced to reinforce the developer/tactical narrative.

All text must maintain a contrast ratio of at least 7:1 against the dark surfaces. Use "Label-caps" for metadata and status indicators to distinguish them from narrative content.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous internal padding to create a sense of "pressurized space." 

- **Desktop:** 12-column grid with 24px gutters. Content is often centered in a max-width container (1440px) to maintain focus.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.
- **Rhythm:** All spacing is based on a 4px baseline unit. Components should use larger stack spacing (`32px+`) to separate functional glass groups, emphasizing the modular, tactical nature of the UI.

## Elevation & Depth

Depth is achieved through **Skeuomorphic Glassmorphism** and tiered luminosity rather than traditional shadows.

1.  **Level 0 (Floor):** The `#020405` background.
2.  **Level 1 (Surface):** Translucent glass panels (15% opacity white overlay) with a `20px` backdrop blur.
3.  **Level 2 (Active Elements):** Panels gain a 1px inner border (top-left light source) to simulate glass thickness.
4.  **Neon Glow:** Primary actions emit a "Tube Light" effect—a soft, `12px` Gaussian blur using the Neon Teal color, appearing as if the light is reflecting off the glass surface from beneath.

## Shapes

The design system uses a consistent **24px (1.5rem)** corner radius for all primary containers and cards to soften the tactical edge and provide a high-end feel. 

- **Buttons & Inputs:** Follow the 24px rule to create a unified "pill-block" appearance.
- **Small Elements (Chips):** Use full-pill rounding (100px) to distinguish them from structural containers.

## Components

- **Buttons:** Primary buttons feature a solid Neon Teal fill with a subtle outer glow. Text is black (`#000000`) for maximum contrast. Secondary buttons are "Ghost Glass" with a 1px teal border.
- **Cards/Containers:** Must implement backdrop-filter (blur) and a subtle gradient stroke (top-left to bottom-right) to simulate light catching the edge of a glass pane.
- **Input Fields:** Darker than the surface background with a focused state that "ignites" the bottom border with a teal glow.
- **Progress Bars:** Designed to look like illuminated gas tubes; the filled portion should have a volumetric glow effect.
- **Status Indicators:** Use the "Tube Light" logic—flashing or steady glows in teal (active), amber (warning), or red (alert) against the dark glass.