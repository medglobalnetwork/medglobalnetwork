---
name: design-system-indiamart
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# IndiaMART

## Mission
Deliver implementation-ready design-system guidance for IndiaMART that can be applied consistently across content site interfaces.

## Brand
- Product/brand: IndiaMART
- URL: https://www.indiamart.com/?srsltid=AU7gw4XdYB40lcuVbvsqv5T9O8JjpgLA07i9sb6_Sc5_Jyl9ZLWj7nBY
- Audience: readers and knowledge seekers
- Product surface: content site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Inter`, `font.family.stack=Inter, system-ui, sans-serif`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=normal`
- Typography scale: `font.size.xs=10px`, `font.size.sm=12px`, `font.size.md=13px`, `font.size.lg=14px`, `font.size.xl=15px`, `font.size.2xl=16px`, `font.size.3xl=18px`, `font.size.4xl=20px`
- Color palette: `color.text.primary=#0000ee`, `color.text.secondary=#161a22`, `color.text.tertiary=#9ca3af`, `color.surface.base=#ffffff`, `color.surface.muted=#000000`, `color.surface.raised=#2e3192`, `color.surface.strong=#1e293b`, `color.border.default=#ced2da`
- Spacing scale: `space.1=2px`, `space.2=4px`, `space.3=5px`, `space.4=6px`, `space.5=8px`, `space.6=10px`, `space.7=12px`, `space.8=13px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=6px`, `radius.md=8px`, `radius.lg=12px`, `radius.xl=999px` | `shadow.1=rgba(22, 24, 29, 0.06) 0px 1px 3px 0px`, `shadow.2=rgba(0, 0, 0, 0.12) 0px 1px 10px 0px`, `shadow.3=rgba(22, 24, 29, 0.08) 0px 4px 12px -2px` | `motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`

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
- Include known page component density: cards (474), links (238), navigation (26), buttons (8), lists (7), inputs (4).

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->

## 1. Context and Goals
This design system defines high-density directory, B2B lead generation, and multi-supplier catalog guidance inspired by IndiaMART for MedGlobalNetwork's Medical Equipment Marketplace.

## 2. Design Tokens and Foundations
- **Color Tokens**:
  - `color.text.primary`: `#0000ee` (Actionable supplier links)
  - `color.text.secondary`: `#161a22` (High-legibility primary copy)
  - `color.text.tertiary`: `#9ca3af` (Muted labels & timestamps)
  - `color.surface.base`: `#ffffff` (Canvas card surface)
  - `color.surface.muted`: `#000000` (Dark accents)
  - `color.surface.raised`: `#2e3192` (IndiaMART trusted blue header/accents)
  - `color.surface.strong`: `#1e293b` (Deep slate footer & contrasts)
  - `color.border.default`: `#ced2da` (Card & table dividers)
- **Typography Scale**:
  - `font.family.primary`: `Inter`, `Inter, system-ui, sans-serif`
  - Scale: `xs=10px`, `sm=12px`, `md=13px`, `lg=14px`, `xl=15px`, `2xl=16px`, `3xl=18px`, `4xl=20px`
  - Base: `14px`, regular weight `400`.
- **Spacing Scale**:
  - `space.1=2px`, `space.2=4px`, `space.3=5px`, `space.4=6px`, `space.5=8px`, `space.6=10px`, `space.7=12px`, `space.8=13px`
- **Radius and Elevation**:
  - Radius: `xs=4px`, `sm=6px`, `md=8px`, `lg=12px`, `xl=999px`
  - Shadows: `shadow.1=rgba(22, 24, 29, 0.06) 0px 1px 3px 0px`, `shadow.2=rgba(0, 0, 0, 0.12) 0px 1px 10px 0px`, `shadow.3=rgba(22, 24, 29, 0.08) 0px 4px 12px -2px`
  - Motion: `instant=150ms`, `fast=200ms`, `normal=300ms`

## 3. Component-Level Rules
- **Known Page Density Targets**:
  - Cards: 474
  - Links: 238
  - Navigation: 26
  - Buttons: 8
  - Lists: 7
  - Inputs: 4
- **Required Component States**:
  - Must specify default, hover, focus-visible, active, disabled, loading, and error states across all controls.
  - Keyboard navigation must support Tab / Enter / Space / Arrow keys.
  - Hover states should execute within 150-200ms without layout jank.

## 4. Accessibility Requirements (WCAG 2.2 AA)
- Contrast must be &ge; 4.5:1 for body copy and &ge; 3:1 for large headlines / focus rings.
- Form inputs must have explicit accessible labels and inline validation messages.
- Modals must preserve focus containment and provide visible focus rings.

## 5. Anti-Patterns & Prohibited Implementations
- Must not use unlabelled icon-only triggers.
- Must not omit supplier verification level or location city metadata.
- Must not introduce arbitrary non-token margins or paddings.
