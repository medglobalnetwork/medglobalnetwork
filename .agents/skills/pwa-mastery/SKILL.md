---
name: pwa-mastery
description: >-
  Standard operating procedure and architectural blueprint for building, auditing,
  and maintaining full-featured Progressive Web Apps (PWAs) with complete offline
  resilience, Service Worker caching strategies, web push notifications, and device
  hardware permissions (Location, Camera, Microphone, Storage persistence, Badging).
---

# PWA Mastery & Hardware Permissions Architecture

## Overview
This skill provides complete guidelines, protocols, and implementation references for deploying production-grade Progressive Web Apps (PWAs) in Next.js and full-stack web applications. It covers offline shell caching, background web push notifications, device permissions orchestration, and standalone installation prompts.

## Key Architectural Components

### 1. Web App Manifest (`app/manifest.ts` & `public/manifest.json`)
Every PWA requires standard and extended manifest declarations:
- `id`, `name`, `short_name`, `description`
- `start_url: "/?source=pwa"` (differentiates app launches from browser tabs)
- `scope: "/"`
- `display: "standalone"`
- `display_override: ["window-controls-overlay", "standalone", "minimal-ui"]`
- `theme_color` and `background_color`
- Standard icons (192x192, 512x512) and `maskable` icon
- Explicit shortcuts with deep links (`Home`, `Feed`, `Messages`, `Settings`)

### 2. Service Worker Engine (`public/sw.js`)
The service worker handles multi-tiered caching and event listeners:
- **Precache Shell**: Essential static assets (`/`, `/favicon.ico`, `/icon-192.png`, `/logo.png`)
- **Navigation Requests**: Network-first strategy falling back to cached shell or styled offline fallback HTML
- **Static Assets**: Stale-while-revalidate for JavaScript bundles, CSS stylesheets, images, and fonts
- **Push Event (`self.addEventListener("push")`)**: Parses notification payload, displays system notification with action buttons (`Open`, `Dismiss`), vibration patterns, and badge icons
- **Notification Click (`self.addEventListener("notificationclick")`)**: Focuses an open window or routes to target URL (`event.notification.data.url`)
- **Lifecycle Management**: Listens for `skipWaiting` message to activate updates without page refresh

### 3. Unified Permissions Library (`lib/pwa-permissions.ts`)
Orchestrates hardware and web permissions via native browser APIs:
- **Push Notifications**: `Notification.requestPermission()`, `PushManager.subscribe()`, and server device token sync
- **Geolocation**: `navigator.geolocation.getCurrentPosition()` with high accuracy
- **Camera Access**: `navigator.mediaDevices.getUserMedia({ video: true })` (immediately stops streams after permission check)
- **Microphone Access**: `navigator.mediaDevices.getUserMedia({ audio: true })`
- **Persistent Storage**: `navigator.storage.persist()` and `navigator.storage.estimate()`
- **App Badging**: `navigator.setAppBadge(count)` and `navigator.clearAppBadge()`
- **Diagnostic Triggers**: `triggerTestNotification()` for immediate end-to-end OS alert testing

### 4. Installation & Prompt UI (`components/pwa/PwaInstallPrompt.tsx`)
- Intercepts and holds `beforeinstallprompt` event
- Detects standalone display mode (`window.matchMedia('(display-mode: standalone)').matches`)
- Detects iOS Safari and provides an illustrated 3-step modal ("Tap Share -> Add to Home Screen")
- Provides custom event trigger (`mgn-trigger-install`) allowing any button in the app to invoke the native install dialog

### 5. Permissions Hub (`app/(app)/settings/permissions/page.tsx`)
- Provides live diagnostic badges for all device permissions
- Offers "Enable All" batch permission request
- Provides one-click testing buttons for push notifications, GPS lock, camera, microphone, storage protection, and icon badging
- Includes cache purge and maintenance tools

## Verification Protocol
1. **Type Check**: Run `npx tsc --noEmit` to ensure zero type errors.
2. **Offline Mode**: Disconnect network in browser DevTools; ensure offline shell loads and `OfflineScreen` renders gracefully.
3. **PWA Audit**: Run Chrome DevTools Lighthouse audit under "Progressive Web App" to confirm all PWA criteria pass.
