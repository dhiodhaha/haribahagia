# Backend Guidance — Invitation Micro App (API)

> This document is a backend-only blueprint for building the API inside `apps/api`. It aligns with the frontend guidance in `guide/frontend_guidance.md` and the ERD provided.

**Legend:**
- 🔌 **Used by Frontend** — API endpoint called by frontend components
- 🔐 **Auth Required** — Protected route, requires JWT
- 🌐 **Public** — No auth required
- ⏭️ **Post-MVP** — Not in MVP scope

---

## 1. Tech Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Hono | 4.11.7 | Lightweight, fast, middleware-based |
| Runtime | Node.js | latest | Via `@hono/node-server` |
| ORM | Prisma | 7.3.0 | With `@prisma/adapter-pg` |
| Database | PostgreSQL | 16 | Via Docker, port 5446 (external) |
| Validation | Zod | to install | Schema validation for requests |
| Auth | JWT (jose) | to install | Stateless auth tokens |
| Password | bcryptjs | to install | Password hashing |
| Language | TypeScript | strict | ESM, bundler module resolution |

### Libraries to Add

```bash
pnpm add zod @hono/zod-validator jose bcryptjs hono/cors
pnpm add -D @types/bcryptjs
```

| Library | Purpose |
|---------|---------|
| `zod` | Request body & param validation |
| `@hono/zod-validator` | Hono middleware for Zod validation |
| `jose` | JWT signing & verification (Edge-compatible, no native deps) |
| `bcryptjs` | Password hashing (pure JS, no native build needed) |
| `hono/cors` | CORS middleware (already in Hono core) |

---

## 2. ERD → Prisma Schema

Based on the provided ERD. The schema uses JSONB for flexible section/theme storage (no separate sections table needed for MVP).

### `apps/api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ⏭️ Post-MVP: AttendanceStatus enum for RSVP
// enum AttendanceStatus {
//   pending
//   attending
//   notAttending
// }

model User {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())

  site Site?

  @@map("users")
}

model Site {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @unique @db.Uuid
  slug        String   @unique
  isPublished Boolean  @default(false)

  themeConfig     Json?  // Global styles: fonts, colors
  contentSections Json?  // Array of sections: [{type, order, enabled, data}, ...]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sites")
}

// ⏭️ Post-MVP: Guest and RSVP models
// model Guest {
//   id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
//   siteId    String   @db.Uuid
//   name      String
//   email     String?
//   phone     String?
//   plusOneAllowed Boolean @default(false)
//   createdAt DateTime @default(now())
//   site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
//   @@map("guests")
// }
```

### Key Design Decisions

- **1 User = 1 Site** — enforced by `@unique` on `userId`. This is the MVP constraint.
- **`contentSections` is JSONB** — sections are stored as a JSON array, not a separate table. This simplifies CRUD and avoids joins for the section manager.
- **`themeConfig` is JSONB** — stores colors, fonts, and style config as a flexible object.
- **⏭️ No guests/RSVP tables in MVP** — commented out in schema, can be added later.

### JSONB Structure Conventions

#### `themeConfig` shape:

```json
{
  "primaryColor": "#0F172A",
  "backgroundColor": "#F8FAFC",
  "accentColor": "#0D9488",
  "fontPair": "inter-fredoka",
  "style": "stitch-neutral"
}
```

#### `contentSections` shape:

```json
[
  {
    "id": "uuid-string",
    "type": "party-intro",
    "order": 0,
    "enabled": true,
    "data": {
      "headline": "Alex's Birthday",
      "subtitle": "The 25th Celebration",
      "emoji": "🎂",
      "welcomeMessage": "You're Invited",
      "heroImage": null
    }
  },
  {
    "id": "uuid-string",
    "type": "time-location",
    "order": 1,
    "enabled": true,
    "data": {
      "date": "2024-10-15",
      "startTime": "19:00",
      "endTime": null,
      "venueName": "The Rooftop Lounge",
      "address": "123 Party Lane, NY",
      "mapLink": null
    }
  }
]
```

### After Writing the Schema

```bash
cd apps/api
pnpm db:migrate    # Creates migration + applies it
pnpm db:generate   # Generates Prisma client
```

---

## 3. Folder Structure

```
apps/api/src/
├── index.ts                    # App entry: create Hono app, mount routes, start server
│
├── routes/
│   ├── auth.ts                 # 🌐 POST /auth/register, POST /auth/login
│   ├── sites.ts                # 🔐🔌 CRUD for sites (invitation)
│   └── public.ts               # 🌐🔌 Public endpoints (view published site)
│
├── middleware/
│   ├── auth.ts                 # 🔐 JWT verification middleware
│   └── error-handler.ts        # Global error handler
│
├── schemas/                    # Zod validation schemas
│   ├── auth.schema.ts          # Register & login request schemas
│   └── site.schema.ts          # Site create/update, section, theme schemas
│
├── utils/
│   ├── prisma.ts               # Prisma client singleton (already exists)
│   ├── jwt.ts                  # JWT sign/verify helpers using jose
│   └── password.ts             # Hash & compare helpers using bcryptjs
│
├── types/
│   └── context.ts              # Hono context variable types (user payload)
│
└── generated/
    └── prisma/                 # Auto-generated Prisma client (gitignored)
```

### Why This Structure

- **`routes/`** — Each file exports a Hono sub-app (via `new Hono()`), mounted in `index.ts`. Keeps routes modular.
- **`schemas/`** — Zod schemas separate from routes. Reusable for validation + TypeScript type inference.
- **`middleware/`** — Auth and error handling as composable middleware.
- **`utils/`** — Pure helper functions with no Hono dependency.
- **`types/`** — Shared TypeScript types for Hono context variables.

---

## 4. Route Design

### 4.1 Auth Routes (`routes/auth.ts`) 🌐

| Method | Path | Auth | Frontend | Description |
|--------|------|------|----------|-------------|
| `POST` | `/auth/register` | 🌐 Public | Auth page | Create new user account |
| `POST` | `/auth/login` | 🌐 Public | Auth page | Login, returns JWT |

**Register flow:**
1. Validate body with Zod (`name`, `email`, `password`)
2. Check if email already exists → 409 Conflict
3. Hash password with bcryptjs
4. Create user in database
5. Sign JWT with user id
6. Return `{ token, user: { id, name, email } }`

**Login flow:**
1. Validate body with Zod (`email`, `password`)
2. Find user by email → 401 if not found
3. Compare password hash → 401 if mismatch
4. Sign JWT with user id
5. Return `{ token, user: { id, name, email } }`

### 4.2 Site Routes (`routes/sites.ts`) 🔐🔌

All routes require auth middleware. Since 1 user = 1 site, most routes operate on "the current user's site" without needing a site ID param.

| Method | Path | Auth | Frontend | Description |
|--------|------|------|----------|-------------|
| `GET` | `/sites/me` | 🔐 | 🔌 Editor layout, all pages | Get current user's site (or null) |
| `POST` | `/sites` | 🔐 | 🔌 Dashboard, "Create Site" | Create site (if user doesn't have one) |
| `PATCH` | `/sites/me` | 🔐 | 🔌 Settings page | Update site (slug, settings) |
| `DELETE` | `/sites/me` | 🔐 | Settings page | Delete site |
| `PATCH` | `/sites/me/publish` | 🔐 | 🔌 Editor header (Publish button) | Toggle publish state |
| `PUT` | `/sites/me/sections` | 🔐 | 🔌 Sections page, Section editor | Replace all sections (full array) |
| `PATCH` | `/sites/me/theme` | 🔐 | 🔌 Theme page | Update theme config |

**Why `/sites/me` instead of `/sites/:id`:**
- Since 1 user = 1 site, the site is always resolved from the authenticated user's JWT.
- Eliminates authorization checks ("does this user own this site?") — it's implicit.
- Simpler frontend integration: no need to pass site IDs around.

**Section operations explained:**

Since `contentSections` is a JSONB column (array), section CRUD is handled by replacing the entire array:

- **Add section:** Frontend appends to array → `PUT /sites/me/sections` with full array 🔌
- **Edit section:** Frontend updates item in array → `PUT /sites/me/sections` with full array 🔌
- **Delete section:** Frontend removes from array → `PUT /sites/me/sections` with full array 🔌
- **Reorder sections:** Frontend reorders array → `PUT /sites/me/sections` with full array 🔌
- **Toggle section:** Frontend toggles `enabled` → `PUT /sites/me/sections` with full array 🔌

This is simpler than granular PATCH endpoints and matches the JSONB storage model. The frontend already holds the full sections array in state.

### 4.3 Public Routes (`routes/public.ts`) 🌐🔌

| Method | Path | Auth | Frontend | Description |
|--------|------|------|----------|-------------|
| `GET` | `/p/:slug` | 🌐 Public | 🔌 Preview page (`preview/$invitationId`) | Get published site by slug |

**Flow:**
1. Find site by slug
2. If not found → 404
3. If not published (`isPublished: false`) → 404
4. Return site data (themeConfig, contentSections) — exclude user password

---

## 5. Zod Validation Schemas

### `schemas/auth.schema.ts`

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8)
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})
```

### `schemas/site.schema.ts`

```typescript
import { z } from 'zod'

export const createSiteSchema = z.object({
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
})

export const updateSiteSchema = z.object({
  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional()
})

export const updateThemeSchema = z.object({
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontPair: z.string().optional(),
  style: z.string().optional()
})

const sectionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['party-intro', 'time-location', 'gift-registry', 'photo-wall', 'rsvp']),
  order: z.number().int().min(0),
  enabled: z.boolean(),
  data: z.record(z.any()) // Flexible per section type
})

export const updateSectionsSchema = z.object({
  sections: z.array(sectionSchema)
})
```

### Hono + Zod Integration

Use `@hono/zod-validator` to validate request bodies inline:

```typescript
import { zValidator } from '@hono/zod-validator'

app.post('/sites', zValidator('json', createSiteSchema), async (c) => {
  const data = c.req.valid('json')
  // data is type-safe here
})
```

This auto-parses the body, validates against the schema, and returns 400 with error details if validation fails.

---

## 6. Authentication (JWT with jose)

### Strategy

- **Stateless JWT** — no sessions table, no refresh tokens (MVP simplicity)
- **Token in Authorization header** — `Authorization: Bearer <token>`
- **Payload:** `{ sub: userId }` — minimal claim
- **Expiry:** 7 days (configurable via env)
- **Algorithm:** HS256 with a secret key

### Environment Variables

```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
```

### `utils/jwt.ts`

```typescript
import * as jose from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signToken(userId: string): Promise<string> {
  return await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  const { payload } = await jose.jwtVerify(token, secret)
  return payload
}
```

### `utils/password.ts`

```typescript
import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 12)
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash)
}
```

### `middleware/auth.ts` 🔐

Hono middleware that:
1. Reads `Authorization` header
2. Extracts Bearer token
3. Verifies JWT via `verifyToken()`
4. If invalid/expired → `401 Unauthorized`
5. If valid → sets `c.set('userId', payload.sub)` on Hono context
6. Calls `next()`

```typescript
import { Context, Next } from 'hono'
import { verifyToken } from '../utils/jwt'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = await verifyToken(token)
    c.set('userId', payload.sub as string)
    await next()
  } catch (error) {
    return c.json({ error: { message: 'Invalid token', code: 'UNAUTHORIZED' } }, 401)
  }
}
```

### Hono Context Typing (`types/context.ts`)

Define the variables available on authenticated routes:

```typescript
type Variables = {
  userId: string
}
```

This provides type-safe access to `c.get('userId')` in route handlers.

---

## 7. Error Handling

### `middleware/error-handler.ts`

Global error handler registered via `app.onError()`.

### Standard Error Response Shape

All errors return this format:

```json
{
  "error": {
    "message": "Human readable message",
    "code": "VALIDATION_ERROR"
  }
}
```

### Error Codes

| HTTP Status | Code | When |
|-------------|------|------|
| 400 | `VALIDATION_ERROR` | Zod validation fails |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired token |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Email already registered, slug taken |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

### Custom Error Class

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string
  ) {
    super(message)
  }
}
```

The error handler middleware catches `AppError` instances and formats the response. Unknown errors return 500 with a generic message (never leak stack traces).

---

## 8. Middleware Stack

Register middleware in `index.ts` in this order:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// 1. CORS
app.use('/*', cors({
  origin: ['http://localhost:3000'],
  credentials: true
}))

// 2. Logger (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use('*', logger())
}

// 3. Error handler
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({
      error: {
        message: err.message,
        code: err.code
      }
    }, err.statusCode)
  }
  
  console.error(err)
  return c.json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  }, 500)
})
```

### CORS Configuration

```typescript
cors({
  origin: ['http://localhost:3000'],  // Platform app
  credentials: true,  // Allow cookies/auth headers
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
})
```

In production, update origin to the deployed frontend URL.

---

## 9. App Entry Point (`index.ts`)

The main file should:

1. Create the Hono app with typed context variables
2. Register global middleware (CORS, logger)
3. Register the error handler
4. Mount route groups:
   - `app.route('/auth', authRoutes)`
   - `app.route('/sites', sitesRoutes)`
   - `app.route('/p', publicRoutes)`
5. Add a health check: `GET /health` → `{ status: "ok" }`
6. Start the server on `PORT` env var (fallback 8000)

### Route Mounting Summary

```
🌐 /health              → Health check
🌐 /auth/register       → Register
🌐 /auth/login          → Login

🔐🔌 /sites/me          → Get/Update/Delete user's site
🔐🔌 /sites             → Create site
🔐🔌 /sites/me/publish  → Toggle publish
🔐🔌 /sites/me/sections → Replace sections array
🔐🔌 /sites/me/theme    → Update theme

🌐🔌 /p/:slug           → Public site view
```

---

## 10. Implementation Order (Suggested)

Build in this order to have a working auth + CRUD flow early:

### MVP Phase:
1. **Install dependencies** — `zod`, `@hono/zod-validator`, `jose`, `bcryptjs`
2. **Write Prisma schema** — Add `User` and `Site` models, run migration
3. **Create folder structure** — `routes/`, `middleware/`, `schemas/`, `utils/`, `types/`
4. **Utils first** — `jwt.ts`, `password.ts` (pure functions, easy to test)
5. **Zod schemas** — `auth.schema.ts`, `site.schema.ts`
6. **Error handler** — `AppError` class + `error-handler.ts` middleware
7. **Auth middleware** — JWT verification middleware
8. **Auth routes** 🌐 — Register + Login (test with curl/Postman)
9. **Site CRUD routes** 🔐🔌 — Create, Get, Update, Delete
10. **Section & theme routes** 🔐🔌 — PUT sections, PATCH theme
11. **Publish route** 🔐🔌 — Toggle publish state
12. **Public route** 🌐🔌 — GET `/p/:slug`
13. **CORS & middleware** — Wire up CORS, logger
14. **Test end-to-end** — Frontend ↔ API integration

### ⏭️ Post-MVP:
15. **Guest models** — Add Guest table to Prisma
16. **Guest routes** — CRUD for guest management
17. **RSVP routes** — Public RSVP submission + viewing

---

## 11. Environment Variables

### Required `.env` at monorepo root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5446/postgres"

# Auth
JWT_SECRET="your-secret-key-at-least-32-characters-long"

# Server
PORT=8000
NODE_ENV=development
```

### Create `.env.example` at monorepo root (committed to git):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5446/postgres"
JWT_SECRET="change-me-to-a-random-32-char-string"
PORT=8000
NODE_ENV=development
```

---

## 12. Database Commands Reference

```bash
# Start database (dev mode)
docker compose -f docker-compose.dev.yml up -d

# Run from apps/api directory:
cd apps/api

# Create migration after schema changes
pnpm db:migrate

# Regenerate Prisma client after schema changes
pnpm db:generate

# Open Prisma Studio (visual DB browser)
pnpm prisma studio

# Reset database (drops all data + re-migrates)
pnpm prisma migrate reset

# Deploy migrations (production, no prompts)
pnpm prisma migrate deploy
```

---

## 13. Frontend ↔ Backend Alignment

How the frontend guidance maps to backend endpoints:

| Frontend Component/Page | Backend Endpoint | Method | Auth | Description |
|-------------------------|------------------|--------|------|-------------|
| Auth page (Register) | `/auth/register` | POST | 🌐 | Create account |
| Auth page (Login) | `/auth/login` | POST | 🌐 | Login |
| Dashboard "Create Site" | `/sites` | POST | 🔐 | Create new site |
| Editor layout (all pages) | `/sites/me` | GET | 🔐 | Fetch current site |
| Settings page | `/sites/me` | PATCH | 🔐 | Update slug |
| Settings page | `/sites/me` | DELETE | 🔐 | Delete site |
| Editor header "Publish" | `/sites/me/publish` | PATCH | 🔐 | Toggle publish |
| Sections page (list) | `/sites/me` | GET | 🔐 | Get sections (from site) |
| Sections page (reorder/edit/add/delete) | `/sites/me/sections` | PUT | 🔐 | Replace sections array |
| Section editor page | `/sites/me/sections` | PUT | 🔐 | Update section data |
| Theme page | `/sites/me/theme` | PATCH | 🔐 | Update theme config |
| Public preview page | `/p/:slug` | GET | 🌐 | View published site |

### Frontend Query → Backend Mapping

| Frontend TanStack Query | Backend Endpoint |
|------------------------|------------------|
| `['site']` → `useSite()` | `GET /sites/me` |
| `createSite` mutation | `POST /sites` |
| `updateSite` mutation | `PATCH /sites/me` |
| `updateSections` mutation | `PUT /sites/me/sections` |
| `updateTheme` mutation | `PATCH /sites/me/theme` |
| `publishSite` mutation | `PATCH /sites/me/publish` |
| `['site', 'public', slug]` | `GET /p/:slug` |

### Note on Data Structure

The backend stores everything in one `Site` row with JSONB columns. The frontend receives:

```json
{
  "id": "...",
  "userId": "...",
  "slug": "alex-birthday",
  "isPublished": false,
  "themeConfig": { "primaryColor": "...", ... },
  "contentSections": [
    { "id": "...", "type": "party-intro", "order": 0, "enabled": true, "data": {...} },
    ...
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

The frontend can split this into separate state/cache keys client-side, but the backend serves it as one unified response from `GET /sites/me`.

---

*This guidance document covers the backend architecture. See `guide/frontend_guidance.md` for the frontend blueprint (React 19, TanStack Start/Router, Tailwind v4).*
