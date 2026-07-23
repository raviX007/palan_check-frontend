# RegulationCheck Web (`regulation-check-web`)

Next.js 16 frontend for RegulationCheck — an agentic compliance platform for Indian and EU regulatory frameworks (DPDP Act 2023, India Labour Codes, GDPR).

This service is the user-facing interface. It talks to `regulation-check-api` for auth and data, and streams compliance chat responses directly from `regulation-check-engine` via SSE.

```
regulation-check-web (this service — port 3000)
      ↓  REST + Clerk JWT
regulation-check-api (port 8000) — auth, documents, conversations, reports
      ↓  SSE stream
regulation-check-engine (port 8001) — AI compliance analysis
```

---

## What this service does

| Responsibility | Detail |
|---|---|
| **Auth** | Clerk-powered sign-in / sign-up; JWT attached to every API request |
| **Route protection** | Clerk middleware guards all `/dashboard`, `/chat`, `/documents`, `/reports`, `/compare`, `/eval` routes |
| **Compliance chat** | SSE-streamed chat with real-time trace events, token streaming, domain score cards, and citation chips |
| **Documents** | Upload PDF/DOCX, list, download, delete |
| **Reports** | View and manage generated compliance reports |
| **Compare** | Side-by-side regulatory comparison view |
| **Eval** | Trigger and view DeepEval evaluation runs |
| **Marketing site** | Public landing page with hero, features, pricing, and interactive demo |

---

## Project structure

```
regulation-check-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout — fonts, Clerk provider
│   │   ├── globals.css                       # Global CSS variables + base styles
│   │   ├── (app)/                            # Authenticated app shell
│   │   │   ├── layout.tsx                    # Sidebar + TopBar shell layout
│   │   │   ├── dashboard/page.tsx            # Compliance overview dashboard
│   │   │   ├── chat/page.tsx                 # SSE compliance chat
│   │   │   ├── documents/page.tsx            # Document upload + management
│   │   │   ├── reports/page.tsx              # Compliance reports
│   │   │   ├── compare/page.tsx              # Regulatory comparison
│   │   │   ├── eval/page.tsx                 # Evaluation suite runner
│   │   │   └── dev-token/page.tsx            # Dev helper — copy Clerk JWT
│   │   ├── (auth)/                           # Clerk-hosted auth pages
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   └── (marketing)/                      # Public landing pages
│   │       ├── page.tsx                      # Home — Hero + Features + Pricing
│   │       └── quick-check/page.tsx          # Unauthenticated trial query
│   ├── components/
│   │   ├── app/
│   │   │   ├── Sidebar.tsx                   # Left navigation
│   │   │   ├── TopBar.tsx                    # Top header with user menu
│   │   │   └── CompanySwitcher.tsx           # Tenant / company switcher
│   │   ├── marketing/
│   │   │   ├── Header.tsx / Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── ProblemSection.tsx
│   │   │   ├── Architecture.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── TrustBar.tsx
│   │   │   └── InteractiveDemo.tsx
│   │   └── ui/
│   │       ├── Badge.tsx                     # Severity / status badge
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── CitationChip.tsx              # Inline citation reference chip
│   │       └── ScoreBar.tsx                  # Compliance score bar
│   ├── lib/
│   │   ├── api.ts                            # Server-side fetch (Server Components + Route Handlers)
│   │   ├── api-client.ts                     # Client-side fetch hook (useApiFetch)
│   │   └── utils.ts                          # clsx/tw merge helper
│   └── proxy.ts                              # Clerk middleware — route protection config
├── public/                                   # Static assets
├── .env.local                                # Local env vars (gitignored)
├── .env.example                              # Env var template
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) application (same app as `regulation-check-api`)
- `regulation-check-api` running on port 8000
- `regulation-check-engine` running on port 8001 (for SSE chat stream)

---

## Setup

### 1. Install dependencies

```bash
cd regulation-check-web
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Clerk (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk redirect paths
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Backend services
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENGINE_URL=http://localhost:8001
```

### 3. Start the dev server

```bash
npm run dev
```

App is live at `http://localhost:3000`.

---

## Pages

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Marketing landing page |
| `/quick-check` | Public | Trial compliance query (no login required) |
| `/sign-in` | Public | Clerk sign-in |
| `/sign-up` | Public | Clerk sign-up |
| `/dashboard` | Required | Compliance overview |
| `/chat` | Required | SSE-streamed compliance chat |
| `/documents` | Required | Upload and manage documents |
| `/reports` | Required | View compliance reports |
| `/compare` | Required | Side-by-side regulatory comparison |
| `/eval` | Required | Run and view evaluation results |
| `/dev-token` | Required | Copy current Clerk JWT (dev helper) |

---

## Chat page — SSE event flow

The `/chat` page connects directly to `regulation-check-engine` and processes a stream of SSE events:

| Event | What the UI does |
|-------|-----------------|
| `trace` | Shows real-time graph node progress (Router → Retriever → Agents → Synthesis) |
| `token` | Appends text to the streaming answer bubble |
| `warning` | Displays a non-fatal warning banner |
| `done` | Renders the final answer, domain score cards, and citation chips |
| `error` | Shows an error message and stops the stream |

Domain score cards (DPDP, Labour, GDPR, Overall) are clickable — clicking opens a modal with the score bar, severity breakdown, and a full findings list colored by severity.

---

## API access pattern

- **Server Components / Route Handlers**: use `apiFetch()` from `src/lib/api.ts` — attaches Clerk JWT server-side via `auth()`.
- **Client Components**: use `useApiFetch()` from `src/lib/api-client.ts` — attaches Clerk JWT client-side via `useAuth()`.

Both helpers prepend `/api/v1` and forward the `Authorization: Bearer <token>` header automatically.

---

## Auth and route protection

`src/proxy.ts` exports a Clerk middleware that guards all authenticated routes. Any unauthenticated request to a protected path is redirected to `/sign-in`.

Protected paths: `/dashboard`, `/chat`, `/documents`, `/reports`, `/compare`, `/eval`, `/dev-token`.

---

## Build

```bash
npm run build
npm start
```

---

## Lint

```bash
npm run lint
```

---

## Related services

| Service | Port | Role |
|---------|------|------|
| `regulation-check-web` | 3000 | This service — Next.js frontend |
| `regulation-check-api` | 8000 | REST API + auth + DB |
| `regulation-check-engine` | 8001 | LangGraph AI engine + SSE streaming |
