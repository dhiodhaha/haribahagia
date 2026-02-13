# Frontend Guidance — Invitation Micro App (Platform)

> This document is a frontend-only blueprint for building the invitation editor micro app inside `apps/platform`. See `guide/backend_guidance.md` for backend API design.

**Legend:**
- 🔌 **Requires API** — Feature needs backend integration
- 📦 **Client-only** — Pure frontend, no API needed
- ⏭️ **Post-MVP** — Not in MVP scope, implement later

---

## 1. Tech Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | 19 | Latest with concurrent features |
| Meta-framework | TanStack Start | 1.132 | SSR, file-based routing |
| Router | TanStack Router | 1.132 | Type-safe, file-based |
| Styling | Tailwind CSS | v4 | New CSS-first config, Vite plugin |
| Build | Vite | 7 | Fast HMR, SSR support |
| Icons | lucide-react | latest | Already installed |
| Language | TypeScript | strict | Path alias `@/*` → `./src/*` |
| Linting | Biome | 2.x | Replaces ESLint + Prettier |

### Libraries to Add

| Library | Purpose | Why |
|---------|---------|-----|
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag & drop section reordering | Modern, accessible, built for React |
| `shadcn/ui` (via `npx shadcn@latest init`) | UI component primitives | Headless + Tailwind, copy-paste components, pairs well with Tailwind v4 |
| `@radix-ui/react-dialog` | Modals/drawers | Comes with shadcn, accessible |
| `@radix-ui/react-toggle` | Toggle switches | Section enable/disable |
| `@radix-ui/react-dropdown-menu` | Dropdown menus | Event selector, user menu |
| `@tanstack/react-query` | Server state management | Already a TanStack Start dependency, use for API calls |
| `class-variance-authority` | Component variants | Consistent styling patterns with shadcn |
| `clsx` + `tailwind-merge` | Class merging utility | Standard with shadcn setup |
| `sonner` | Toast notifications | Lightweight, pairs with shadcn |

### Fonts (load via `@fontsource` or Google Fonts link in `__root.tsx`)

- **Inter** (weights: 300, 400, 500, 600, 700) — UI sans-serif
- **Fredoka** (weights: 400, 600) — Display/heading font for invitation preview

---

## 2. Route Structure

TanStack Router uses **file-based routing** under `src/routes/`. Each file becomes a route.

```
src/routes/
├── __root.tsx                          # Root layout (HTML shell, global providers)
├── index.tsx                           # 🔌 Landing / dashboard (list of invitations)
│
├── invitations/
│   ├── new.tsx                         # 🔌 Create new invitation
│   │
│   └── $invitationId/                  # Dynamic: /invitations/:invitationId
│       ├── route.tsx                   # Editor layout (sidebar + main + preview)
│       ├── sections.tsx                # 🔌 Section manager (default editor view)
│       ├── sections.$sectionId.tsx     # 🔌 Edit a specific section
│       ├── theme.tsx                   # 🔌 Theme & colors editor
│       ├── settings.tsx                # 🔌 Invitation settings (slug, publish)
│       ├── guests.tsx                  # ⏭️ Guest list management (Post-MVP)
│       ├── rsvp.tsx                    # ⏭️ RSVP responses view (Post-MVP)
│       └── analytics.tsx               # 📦 View invitation analytics (client-only)
│
└── preview/
    └── $invitationId.tsx               # 🔌 Public preview / published invitation page
```

### Key Routing Patterns

- **`$invitationId`** — Dynamic segment. Access via `Route.useParams()`.
- **`route.tsx`** inside `$invitationId/` — This is the **layout route**. It wraps all child routes with the editor shell (sidebar + preview). Child routes render into `<Outlet />`.
- **`sections.$sectionId.tsx`** — Nested dynamic param for editing a specific section.
- **`preview/$invitationId.tsx`** — Separate from the editor; this is the public-facing invitation page guests will see.

---

## 3. Page & Layout Architecture

### 3.1 Editor Layout (`invitations/$invitationId/route.tsx`)

This is the core layout that wraps all editor sub-pages. It renders the **sidebar**, **main content area**, and **live preview panel**.

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────┐ ┌──────────────────┐  │
│ │          │ │  Header (title, save,    │ │  Preview Header  │  │
│ │ Sidebar  │ │  share, publish)         │ │  (device toggle) │  │
│ │          │ ├──────────────────────────┤ ├──────────────────┤  │
│ │ - Event  │ │                          │ │                  │  │
│ │   picker │ │                          │ │   ┌──────────┐   │  │
│ │          │ │     <Outlet />           │ │   │  Phone   │   │  │
│ │ Editor   │ │                          │ │   │  Frame   │   │  │
│ │ - Theme  │ │  (sections, theme,       │ │   │          │   │  │
│ │ - Section│ │   settings pages         │ │   │  Live    │   │  │
│ │ - Setting│ │   render here)           │ │   │  Preview │   │  │
│ │          │ │                          │ │   │          │   │  │
│ │ Manage   │ │                          │ │   └──────────┘   │  │
│ │ - ⏭️ Guests│ │                          │ │                  │  │
│ │ - ⏭️ RSVP │ │                          │ │                  │  │
│ │ - 📦 Stats│ │                          │ │                  │  │
│ │          │ │                          │ │                  │  │
│ ├──────────┤ └──────────────────────────┘ └──────────────────┘  │
│ │ User     │                                                    │
│ │ Profile  │                                                    │
│ └──────────┘                                                    │
└──────────────────────────────────────────────────────────────────┘
      w-64              flex-1                    w-[450px]
                                              (hidden < lg)
```

**Responsive behavior:**
- `< lg`: Hide preview panel. Show a floating "Preview" button (mobile).
- `< md`: Sidebar collapses into a hamburger drawer.

### 3.2 Sections Manager Page (`sections.tsx`) 🔌

The default editor view. Displays all invitation sections as **draggable cards** in a vertical list.

**API Integration:** Fetches from `GET /sites/me`, updates via `PUT /sites/me/sections`

**Each section card shows:**
- Drag handle (left)
- Icon + thumbnail
- Section name + description
- Edit button → navigates to `sections.$sectionId`
- Enable/disable toggle

**Bottom of list:** "Add New Section" dashed button → opens a modal/drawer with available section types.

### 3.3 Section Editor Page (`sections.$sectionId.tsx`) 🔌

Edit form for a specific section. Content varies by section type.

**API Integration:** Updates via `PUT /sites/me/sections` (replaces full sections array)

| Section Type | Editable Fields |
|-------------|----------------|
| Party Intro | Hero image, headline, subtitle, emoji, welcome message |
| Time & Location | Date, start/end time, venue name, address, map link |
| Gift Registry | Description text, registry links (URL list) |
| Photo Wall | Gallery images (upload/reorder), captions |
| RSVP | Enabled toggle, max guests, custom questions, deadline |

**Layout:** Form on the left, live preview updates on the right as the user types.

### 3.4 Theme & Colors Page (`theme.tsx`) 🔌

**API Integration:** Updates via `PATCH /sites/me/theme`

- Color palette picker (primary, background, accent, text colors)
- Font family selector (from preset pairs)
- Invitation style/template selector (e.g., "Stitch Neutral", "Playful", "Elegant")
- Preview updates in real-time

### 3.5 Management Pages

| Page | Status | Purpose | Key UI |
|------|--------|---------|--------|
| `settings.tsx` | 🔌 MVP | Invitation settings | Slug/URL, publish toggle, share link |
| `analytics.tsx` | 📦 MVP | View invitation analytics | View count (client-side tracked), link clicks |
| `guests.tsx` | ⏭️ Post-MVP | Manage guest list | Table/list with name, email/phone, RSVP status, add/import |
| `rsvp.tsx` | ⏭️ Post-MVP | View RSVP responses | Summary stats, response list, export |

---

## 4. Component Breakdown

### 4.1 Folder Structure for Components

```
src/
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, dialog, input, etc.)
│   ├── layout/
│   │   ├── editor-sidebar.tsx  # Sidebar navigation
│   │   ├── editor-header.tsx   # Top toolbar (title, save, share, publish) 🔌
│   │   └── editor-layout.tsx   # 3-column layout shell
│   ├── sections/
│   │   ├── section-card.tsx    # Draggable section card
│   │   ├── section-list.tsx    # Sortable section list (uses dnd-kit) 🔌
│   │   ├── add-section-modal.tsx
│   │   └── editors/            # Section-specific edit forms 🔌
│   │       ├── party-intro-editor.tsx
│   │       ├── time-location-editor.tsx
│   │       ├── gift-registry-editor.tsx
│   │       ├── photo-wall-editor.tsx
│   │       └── rsvp-editor.tsx
│   └── preview/
│       ├── preview-panel.tsx   # Preview wrapper (device frame + toggle) 📦
│       ├── phone-frame.tsx     # Mobile device frame UI 📦
│       └── invitation-preview.tsx  # Renders invitation content 📦
│
├── hooks/
│   ├── use-site.ts             # 🔌 Fetch/mutate site data (TanStack Query)
│   ├── use-sections.ts         # 🔌 Section CRUD + reorder
│   └── use-preview.ts          # 📦 Preview state (device mode, scroll sync)
│
├── contexts/
│   └── site-context.tsx        # Editor-wide state (current site data)
│
├── lib/
│   ├── utils.ts                # cn() helper (clsx + tailwind-merge)
│   └── section-registry.ts    # Section type definitions, defaults, icons
│
├── types/
│   └── site.ts                 # TypeScript types for site, section, etc.
│
└── routes/
    └── (as described in section 2)
```

### 4.2 Key Components

#### EditorSidebar
- Fixed left panel (`w-64`)
- Site title display at top (from current site)
- Two nav groups: "Editor" (Theme, Sections, Settings) and "Management" (⏭️ Guests, ⏭️ RSVP, Analytics)
- Active route highlighting using TanStack Router's `Link` component with `activeProps`
- User profile + plan badge at bottom

#### SectionCard
- Horizontal card layout: drag handle | icon | title + description | edit button | toggle
- Props: `section` data, `onEdit`, `onToggle`, `dragHandleProps` (from dnd-kit)
- Hover state: border highlight

#### SectionList 🔌
- Wraps `SectionCard` components with dnd-kit's `SortableContext`
- On drag end: reorder sections array, call mutation to persist order via `PUT /sites/me/sections`
- Use `restrictToVerticalAxis` modifier for cleaner UX
- Use `closestCenter` collision detection

#### PreviewPanel 📦
- Right panel (`w-[450px]`, hidden on `< lg`)
- Header bar: "Live Preview" label + synced badge + device toggle (mobile/desktop)
- Phone frame: rounded container with notch, home indicator
- Renders `InvitationPreview` inside the frame
- Content scrolls independently

#### InvitationPreview 📦
- Renders all **enabled** sections in order using the current theme
- Each section type has a corresponding preview component
- Reacts to editor state changes in real-time (via context or state)
- Same component used for the public preview route (`preview/$invitationId.tsx`)

---

## 5. State Management

### 5.1 Server State — TanStack Query 🔌

Use `@tanstack/react-query` for all data fetching and mutations.

**Query keys (MVP):**
- `['site']` — Full site data (includes theme + sections)
- `['site', 'public', slug]` — Public site by slug (for preview page)

**Mutations (MVP):**
- `createSite` — Create new site (`POST /sites`)
- `updateSite` — Update slug or settings (`PATCH /sites/me`)
- `updateSections` — Replace full sections array (`PUT /sites/me/sections`)
- `updateTheme` — Update theme config (`PATCH /sites/me/theme`)
- `publishSite` — Toggle publish state (`PATCH /sites/me/publish`)

**⏭️ Post-MVP mutations:**
- `addGuest`, `updateGuest`, `deleteGuest`
- `getGuestRSVPs`

### 5.2 Client State — React Context 📦

Create a `SiteContext` provided in the editor layout route (`route.tsx`):

**What it holds:**
- Current site data (from query cache)
- Optimistic section order (for instant drag-drop feedback)
- Preview device mode (mobile / desktop)
- Dirty/unsaved state flag
- Active section ID (for highlighting in preview)

**Why context instead of global store:**
- Scoped to the editor layout — no global pollution
- Works naturally with TanStack Query's cache as source of truth
- Simple enough that Zustand/Redux is unnecessary

### 5.3 Preview Sync Strategy 📦

The preview panel reads from the same context/query cache as the editor:

1. User edits a section form field
2. Form updates local state → triggers mutation (debounced)
3. Mutation uses `optimistic updates` to immediately update query cache
4. Preview component re-renders because it reads from the same query cache
5. Result: near-instant preview updates

---

## 6. Design System & UI Tokens

### 6.1 Tailwind v4 Theme Setup

In Tailwind v4, theming is done via CSS custom properties in your `styles.css`, not `tailwind.config.js`.

Add to `apps/platform/src/styles.css`:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #0F172A;
  --color-primary-hover: #1E293B;
  --color-background: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-sidebar: #FFFFFF;
  --color-border: #E2E8F0;
  --color-accent: #0D9488;
  --color-accent-hover: #0F766E;

  /* Dark mode overrides via .dark class */
  --color-background-dark: #121212;
  --color-surface-dark: #1E1E1E;
  --color-sidebar-dark: #0A0A0A;
  --color-border-dark: #2E2E2E;

  /* Fonts */
  --font-sans: "Inter", sans-serif;
  --font-display: "Fredoka", sans-serif;

  /* Radius */
  --radius-default: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### 6.2 Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `primary` | `#0F172A` (slate-900) | `#FFFFFF` | Primary text, buttons |
| `background` | `#F8FAFC` (slate-50) | `#121212` | Page background |
| `surface` | `#FFFFFF` | `#1E1E1E` | Cards, panels |
| `sidebar` | `#FFFFFF` | `#0A0A0A` | Sidebar background |
| `border` | `#E2E8F0` (slate-200) | `#2E2E2E` | Borders, dividers |
| `accent` | `#0D9488` (teal-600) | `#0D9488` | Publish button, toggles, active states |
| `muted` | `#64748B` (slate-500) | `#94A3B8` | Secondary text, descriptions |

### 6.3 Typography

| Style | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| Heading 1 | Fredoka | 600 | text-xl (20px) | Page titles |
| Heading 2 | Inter | 600 | text-lg (18px) | Section headers |
| Body | Inter | 400 | text-sm (14px) | General text |
| Caption | Inter | 500 | text-xs (12px) | Labels, metadata |
| Nav item | Inter | 500 | text-sm (14px) | Sidebar links |
| Preview heading | Fredoka | 300–600 | text-5xl | Invitation hero |

### 6.4 Dark Mode 📦

Use the `class` strategy (already implied by the mockup's `dark:` prefixes):

- Toggle via a class on `<html>` or `<body>`: `class="dark"`
- Store preference in `localStorage`
- Respect system preference via `prefers-color-scheme` as default
- All components use `dark:` variant classes

---

## 7. Drag & Drop — dnd-kit 📦 + 🔌

### Setup

Use `@dnd-kit/core` and `@dnd-kit/sortable` for section reordering.

### Integration Approach

1. Wrap the section list with `<DndContext>` and `<SortableContext>` 📦
2. Each `SectionCard` uses `useSortable()` hook 📦
3. On `onDragEnd`: compute new order → optimistically update context → fire mutation 🔌
4. Use `restrictToVerticalAxis` modifier for cleaner UX 📦
5. Use `closestCenter` collision detection 📦

### UX Details
- Drag handle on the left side of each card (the `drag_indicator` icon)
- Subtle lift animation on drag start
- Drop placeholder line between cards
- Smooth reorder animation via dnd-kit's built-in CSS transitions

---

## 8. Live Preview Panel 📦

### Structure

```
┌─────────────────────────┐
│ Live Preview    [📱][🖥] │  ← Header bar
├─────────────────────────┤
│  ┌───────────────────┐  │
│  │    ▬▬▬▬▬▬▬▬▬▬     │  │  ← Notch
│  │                   │  │
│  │   Invitation      │  │
│  │   Content         │  │  ← Scrollable
│  │   Renders Here    │  │
│  │                   │  │
│  │   ───────────     │  │  ← Home indicator
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Behavior
- **Mobile mode (default):** 320×640px phone frame with rounded corners, notch, and home indicator
- **Desktop mode:** Full-width preview without phone frame
- **Sync:** Reads from the same `SiteContext` — any edit in the left panel instantly reflects here
- **Scroll sync (optional):** When user clicks "edit" on a section, preview auto-scrolls to that section
- **Synced badge:** Shows green "Synced" when preview matches saved state; shows yellow "Unsaved" when there are pending changes

### The InvitationPreview Component
- Iterates over `sections.filter(s => s.enabled).sort(s => s.order)`
- For each section, renders the matching preview component (PartyIntroPreview, TimeLocationPreview, etc.)
- Applies the current theme (colors, fonts) via CSS variables or inline styles
- This **same component** is reused for the public-facing `preview/$invitationId` route

---

## 9. Section Type Registry 📦

Define all available section types in a registry for consistency:

```
src/lib/section-registry.ts
```

Each section type definition should include:
- `type` — unique key (e.g., `"party-intro"`, `"time-location"`)
- `label` — display name (e.g., `"Party Intro"`)
- `description` — short description (e.g., `"Hero image, headline & welcome message"`)
- `icon` — lucide icon name (e.g., `"PartyPopper"`, `"Clock"`)
- `defaultData` — default content when a new section of this type is added
- `editorComponent` — reference to the editor form component
- `previewComponent` — reference to the preview render component

### Available Section Types (MVP)

| Type | Icon | Description | Default Enabled |
|------|------|-------------|----------------|
| `party-intro` | `PartyPopper` | Hero image, headline & welcome message | Yes |
| `time-location` | `Clock` | When & where the event happens | Yes |
| `gift-registry` | `Gift` | Wishlist links & gift preferences | Yes |
| `photo-wall` | `Images` | Fun memories gallery | Yes |
| `rsvp` | `CheckCircle` | RSVP form | Yes |

> More section types can be added later (e.g., dress code, music requests, countdown timer).

---

## 10. Recommended Folder Structure

Full recommended structure for `apps/platform/src/`:

```
apps/platform/src/
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── switch.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   └── toast.tsx
│   │
│   ├── layout/
│   │   ├── editor-sidebar.tsx
│   │   ├── editor-header.tsx
│   │   └── editor-layout.tsx
│   │
│   ├── sections/
│   │   ├── section-card.tsx
│   │   ├── section-list.tsx
│   │   ├── add-section-modal.tsx
│   │   └── editors/
│   │       ├── party-intro-editor.tsx
│   │       ├── time-location-editor.tsx
│   │       ├── gift-registry-editor.tsx
│   │       ├── photo-wall-editor.tsx
│   │       └── rsvp-editor.tsx
│   │
│   └── preview/
│       ├── preview-panel.tsx
│       ├── phone-frame.tsx
│       ├── invitation-preview.tsx
│       └── sections/
│           ├── party-intro-preview.tsx
│           ├── time-location-preview.tsx
│           ├── gift-registry-preview.tsx
│           ├── photo-wall-preview.tsx
│           └── rsvp-preview.tsx
│
├── hooks/
│   ├── use-site.ts                 # 🔌 Fetch/mutate site
│   ├── use-sections.ts             # 🔌 Section operations
│   └── use-preview.ts              # 📦 Preview state
│
├── contexts/
│   └── site-context.tsx            # 📦 Editor state
│
├── lib/
│   ├── utils.ts                    # 📦 cn() helper
│   └── section-registry.ts         # 📦 Section definitions
│
├── types/
│   └── site.ts                     # All TypeScript types
│
├── styles.css                      # Tailwind v4 theme + global styles
├── router.tsx
├── routeTree.gen.ts
│
└── routes/
    ├── __root.tsx
    ├── index.tsx
    ├── invitations/
    │   ├── new.tsx
    │   └── $invitationId/
    │       ├── route.tsx
    │       ├── sections.tsx
    │       ├── sections.$sectionId.tsx
    │       ├── theme.tsx
    │       ├── settings.tsx
    │       ├── guests.tsx          # ⏭️ Post-MVP
    │       ├── rsvp.tsx            # ⏭️ Post-MVP
    │       └── analytics.tsx       # 📦 MVP
    └── preview/
        └── $invitationId.tsx
```

---

## 11. Implementation Order (Suggested)

Build in this order to have a working flow early and iterate:

### MVP Phase:
1. **Scaffold routes** — Create all route files with placeholder content
2. **Editor layout** — Build the 3-column layout shell (`route.tsx`, sidebar, header)
3. **Section list** — Static section cards (no drag yet)
4. **Preview panel** — Phone frame + static preview 📦
5. **State management** — SiteContext + TanStack Query hooks 🔌
6. **Drag & drop** — Wire up dnd-kit for section reordering 📦 + 🔌
7. **Section editors** — Build edit forms for each section type 🔌
8. **Live preview sync** — Connect editor forms to preview rendering
9. **Theme editor** — Color/font picker with live preview 🔌
10. **Settings page** — Slug editor, publish toggle 🔌
11. **Public preview route** — Published site view 🔌
12. **Polish** — Dark mode toggle, responsive breakpoints, loading states, toasts

### ⏭️ Post-MVP:
13. **Guest management** — Import, add, list guests
14. **RSVP tracking** — View responses, export data
15. **Enhanced analytics** — More detailed metrics

---

## 12. TypeScript Types (Reference)

Aligned with backend schema (`guide/backend_guidance.md`):

```typescript
// types/site.ts

// Matches backend User model
interface User {
  id: string
  name: string
  email: string
  password?: never  // Never expose password to frontend
  createdAt: string
}

// Matches backend Site model
interface Site {
  id: string
  userId: string
  slug: string
  isPublished: boolean
  themeConfig: ThemeConfig | null
  contentSections: Section[] | null
  createdAt: string
  updatedAt: string
}

interface ThemeConfig {
  primaryColor: string
  backgroundColor: string
  accentColor: string
  fontPair: string
  style: string
}

interface Section {
  id: string
  type: 'party-intro' | 'time-location' | 'gift-registry' | 'photo-wall' | 'rsvp'
  order: number
  enabled: boolean
  data: Record<string, any>  // Flexible per section type
}

// Section-specific data types
interface PartyIntroData {
  headline: string
  subtitle: string
  emoji: string
  welcomeMessage: string
  heroImage: string | null
}

interface TimeLocationData {
  date: string
  startTime: string
  endTime: string | null
  venueName: string
  address: string
  mapLink: string | null
}

interface GiftRegistryData {
  description: string
  registryLinks: { label: string; url: string }[]
}

interface PhotoWallData {
  photos: { url: string; caption: string | null }[]
}

interface RSVPData {
  enabled: boolean
  maxGuests: number
  customQuestions: string[]
  deadline: string | null
}

// ⏭️ Post-MVP: Guest types
interface Guest {
  id: string
  siteId: string
  name: string
  email: string | null
  phone: string | null
  plusOneAllowed: boolean
  createdAt: string
}

interface RSVPResponse {
  id: string
  guestId: string
  siteId: string
  willAttend: boolean
  guestCount: number
  message: string | null
  submittedAt: string
}
```

---

*This guidance document covers the frontend architecture. See `guide/backend_guidance.md` for backend API design (Hono routes, Prisma schema, authentication).*
