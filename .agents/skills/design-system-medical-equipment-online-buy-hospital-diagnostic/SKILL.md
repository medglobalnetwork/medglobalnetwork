---
name: design-system-medical-equipment-online-buy-hospital-diagnostic
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Medical Equipment Online – Buy Hospital & Diagnostic Equipment

## Mission
Deliver implementation-ready design-system guidance for Medical Equipment Online – Buy Hospital & Diagnostic Equipment that can be applied consistently across e-commerce storefront interfaces.

## Brand
- Product/brand: Medical Equipment Online – Buy Hospital & Diagnostic Equipment
- URL: https://www.medikabazaar.com/medicalequipments?srsltid=AU7gw4Wsv_isxelsERO7rOcg61RGZKoq3epfxYRh0N0yMsqSI0J0cVPZ
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=__Manrope_93ecc3`, `font.family.stack=__Manrope_93ecc3, __Manrope_Fallback_93ecc3`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=12px`, `font.size.md=14px`, `font.size.lg=14.4px`, `font.size.xl=16px`, `font.size.2xl=18px`, `font.size.3xl=20.8px`, `font.size.4xl=24px`
- Color palette: `color.text.primary=#191d23`, `color.text.secondary=#444444`, `color.text.tertiary=#181818`, `color.surface.muted=#ffffff`, `color.surface.base=#000000`, `color.focus.ring=oklab(0.708 0 0 / 0.5)`
- Spacing scale: `space.1=10px`, `space.2=12px`, `space.3=16px`, `space.4=32px`
- Radius/shadow/motion tokens: `radius.xs=14px`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (348), buttons (75), navigation (1), lists (1).

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->

## 1. Context and Goals
This design system standardizes clinical equipment storefront components across MedGlobalNetwork. It enables healthcare procurement managers, doctors, and hospital administrators to evaluate technical specifications, verify CDSCO/CE certifications, request bulk quotation pricing (RFQ), and compare capital equipment efficiently.

## 2. Design Tokens and Foundations
- **Brand Colors**:
  - `color.brand.primary`: `#0f4c81` (MGN clinical navy)
  - `color.brand.accent`: `#16804d` (Verified certification green)
  - `color.text.primary`: `#191d23` (Light mode base body text)
  - `color.text.secondary`: `#444444` (Specification subtitles and meta tags)
  - `color.text.tertiary`: `#181818` (High-contrast headings)
  - `color.surface.muted`: `#ffffff` (Card background light)
  - `color.surface.base`: `#faf9f8` (Page canvas light, dark: `#0d1117`)
  - `color.focus.ring`: `oklab(0.708 0 0 / 0.5)` or `#0f4c81` (min 3:1 contrast against surface)
- **Typography**:
  - Primary Font: `__Manrope_93ecc3`, fallback stack: `__Manrope_93ecc3, __Manrope_Fallback_93ecc3, system-ui, sans-serif`
  - Scale: `xs=10px`, `sm=12px`, `md=14px`, `lg=14.4px`, `xl=16px`, `2xl=18px`, `3xl=20.8px`, `4xl=24px`
  - Base: `16px` / `24px` line height, regular `400` weight.
- **Spacing Scale**:
  - `space.1`: `10px`
  - `space.2`: `12px`
  - `space.3`: `16px`
  - `space.4`: `32px`
- **Radius and Elevation**:
  - `radius.xs`: `14px` (cards, modal containers, inputs)

## 3. Component-Level Rules
- **Known Page Density Targets**:
  - Links: 348
  - Buttons: 75
  - Navigation: 1
  - Lists: 1
- **Required Component States**:
  - Default: semantic token backgrounds, high contrast text.
  - Hover: subtle background luminosity shift (+5-8%), elevation transition.
  - Focus-visible: 2px solid ring, 2px offset, fully keyboard accessible.
  - Active: scale 0.98, immediate visual feedback.
  - Disabled: opacity 50%, `aria-disabled="true"`, pointer events disabled.
  - Loading: skeleton shimmer / spinner, `aria-busy="true"`.
  - Error: `border-red-600`, visible helper text, `aria-invalid="true"`.

## 4. Accessibility Requirements (WCAG 2.2 AA)
- Contrast ratio must equal or exceed 4.5:1 for standard text and 3:1 for large text / graphical controls.
- All interactive controls must be operable via Tab, Shift+Tab, Enter, and Space.
- Dialogs must trap focus, prevent background scrolling, and dismiss on Escape.
- Touch target sizes must meet minimum 44x44px bounding box or have adequate spacing padding.

## 5. Anti-Patterns & Prohibited Implementations
- Must not use arbitrary raw hex colors outside design tokens.
- Must not suppress focus indicators with `outline: none` without a high-contrast replacement.
- Must not hide required product specifications or regulatory compliance credentials.
