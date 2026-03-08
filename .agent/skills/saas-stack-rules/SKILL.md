---
name: saas-stack-rules
description: Stack-specific rules for SaaS projects using Next.js + FastAPI + Supabase + iron-session + LangGraph + Stripe. Enforces auth patterns, RLS policies, async code, AI agent architecture, and billing security. Use when building SaaS products or full-stack applications with this tech stack.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# SaaS Stack Rules

> Stack-specific coding rules for the standard SaaS architecture:
> **Next.js + FastAPI + Supabase + iron-session + LangGraph + Stripe**

These rules are **activated per-project**, not global. They complement the universal rules in GEMINI.md.

---

## 🔐 Authentication & Session

- Authentication between frontend and backend ALWAYS via **iron-session** (cookie httpOnly, secure, sameSite=lax)
- `SESSION_SECRET` with 32+ characters, stored exclusively in environment variables
- Frontend NEVER communicates directly with the backend — all requests go through the authenticated proxy (Next.js API Routes)
- The proxy decrypts the cookie, extracts the `user_id`, and forwards via `X-User-Id` header to the backend
- Backend validates the `X-User-Id` header on ALL protected routes via dependency injection
- Tokens, session IDs, and refresh tokens are NEVER exposed in the frontend (not in localStorage, sessionStorage, or JS-accessible cookies)

---

## 🛡️ Row Level Security (RLS)

- ALL Supabase tables MUST have RLS enabled, no exceptions
- Every table with user data MUST have a `user_id` column with isolation policy
- Mandatory policies per table: SELECT, INSERT, UPDATE, DELETE filtered by `auth.uid() = user_id`
- Public tables (e.g., `plans`) MUST have explicit read-only policy
- Write operations on public tables ONLY via `service_role` in the backend
- Isolation test: User A MUST NEVER access User B's data

---

## 🌐 APIs & Endpoints

- ALL API routes MUST be authenticated (except health check and explicitly public routes)
- Input validation mandatory on ALL routes via Pydantic models
- Rate limiting by `user_id` on sensitive routes (auth, content generation, billing)
- Restrictive CORS: accept requests ONLY from frontend domains
- Stripe webhooks MUST validate signature before processing
- File upload: validate MIME type, extension, and maximum size before accepting

---

## ⚡ Async Code

- ALL FastAPI routes and services MUST be `async`
- ALL external API calls (Supabase, Stripe, LLMs, Fal.ai) MUST be `await` — never blocking
- AI response streaming via SSE (Server-Sent Events) — never wait for complete response to send
- Database and external API connections MUST have timeout configured

---

## 🤖 AI Agents (LangGraph)

- Agents MUST be implemented with LangGraph (state machine with nodes and transitions)
- Each graph node MUST have single responsibility and typed output
- Agent responses MUST use Structured Output (Pydantic models) — never free text for structured data
- Agent tools MUST have individual error handling — one tool failure must not crash the graph
- Agent prompts MUST be in separate files, never hardcoded inside logic

---

## 💳 Billing (Stripe)

- Stripe API keys exclusively in `.env` — NEVER in frontend code
- Webhook endpoint MUST validate `stripe-signature` header
- Subscription status changes MUST be handled via webhooks, not polling
- Price IDs and plan details MUST come from database, not hardcoded
- Always handle edge cases: failed payments, expired cards, subscription downgrades

---

## 📁 Project Structure (Reference)

```
project/
├── frontend/          # Next.js App Router
│   ├── app/           # Pages (App Router)
│   ├── components/    # UI components
│   ├── lib/           # Utilities, API client, hooks
│   └── api/           # Proxy routes (iron-session → backend)
│
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/       # Route handlers (organized by domain)
│   │   ├── services/  # Business logic
│   │   ├── schemas/   # Pydantic models
│   │   ├── agents/    # LangGraph agents (if AI)
│   │   └── core/      # Config, auth middleware, dependencies
│   └── requirements.txt
│
└── docs/              # PRDs, plans, discovery notes
```

---

## 🔗 Stack Reference

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + TypeScript + Tailwind + shadcn/ui | UI, routing, SSR |
| Backend | FastAPI + Python 3.11+ | API, business logic |
| Database | Supabase (PostgreSQL + Auth + Storage + RLS) | Data, auth, files |
| Auth | iron-session (httpOnly cookie) | Session management |
| AI | LangGraph + OpenAI/Anthropic | Agent orchestration |
| Payments | Stripe | Subscriptions, billing |
| Hosting | Vercel (frontend) + Railway (backend) | Deployment |
