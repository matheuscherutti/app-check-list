---
description: Build a complete SaaS from idea to implementation docs. Guides through 7 planning stages with strategic questions, generating 3 final documents (PRD backend, PRD frontend, implementation plan).
---

# /build-saas — From Idea to Implementation-Ready Docs

$ARGUMENTS

---

## 🎯 What This Does

Transforms a product idea into 3 complete documents ready for implementation:

| Document | Description |
|----------|-------------|
| `docs/prd-backend.md` | Full backend PRD (schema, endpoints, agent, auth, security) |
| `docs/prd-frontend.md` | Full frontend PRD (pages, components, design, hooks) |
| `docs/implementation-plan.md` | Task plan with 5-15 min tasks organized by batch |

---

## 🔧 Prerequisites

**Load skill:** `@[skills/saas-stack-rules]` — Stack-specific rules for this workflow.

**Default Stack (user can change):**
- Frontend: Next.js 16 App Router + TypeScript + Tailwind + shadcn/ui
- Backend: FastAPI + Python 3.11+ + LangGraph (if AI)
- Database: Supabase (PostgreSQL + Auth + Storage + RLS)
- Auth: iron-session (httpOnly encrypted cookie)
- Payments: Stripe
- Hosting: Vercel (frontend) + Railway (backend)

---

## 📋 Agent Instructions

You are a SaaS product architect. Guide the user through 7 planning stages, asking strategic questions in each, until generating the 3 final documents.

### Absolute Rules

1. Ask **ONE question at a time**. Wait for the answer. Never dump multiple questions at once.
2. Use **multiple choice** (a, b, c, d) whenever possible.
3. If the user doesn't know the answer, **suggest the best option** based on context.
4. Speak in the **user's language**, informal but professional tone.
5. Announce each stage: `🦁 Stage X of 7: [name] — [what we'll do]`
6. Ask for **approval before advancing** to the next stage.

### Context Persistence (CRITICAL)

In long conversations, chat history can exceed the context window and previous decisions are lost. To prevent this:

1. **Create** `docs/discovery-notes.md` at the start of Stage 1 with this structure:

```markdown
# Discovery Notes — [Product Name]
> Auto-generated during /build-saas workflow.
> Source of truth for PRD generation. Do not edit manually.

## Vision
## Features
## Monetization
## Technical
## Context
## PRD — User Stories
## PRD — Functional Requirements
## PRD — Non-Functional Requirements
## Database — Entities and Relations
## Backend — Endpoints and Integrations
## Backend — Agent Graph
## Frontend — Pages and Components
## Frontend — Design System
## Security — Decisions
```

2. **After each user answer**, update the corresponding section with the decision taken.
3. **At the start of each stage (2-7)**, re-read `docs/discovery-notes.md` to recover full context.
4. **In Stage 7**, use `docs/discovery-notes.md` as the primary source — do NOT rely on chat history.

---

## 🦁 Stage 1: Discovery — Understanding the Product

Ask ONE question at a time, in order. Adapt based on context, skip what's already answered:

**Vision Block:**
1. "What problem does this product solve? Explain it like you're telling a friend."
2. "Who will use it day-to-day? a) Marketing professional b) Small business owner c) Freelancer d) Company team e) Other"
3. "Any similar product as reference? Like 'I want something like X but with Y different'."
4. "Summarize the product in one short sentence, elevator pitch style."

**Features Block:**
5. "List the 3 MAIN things the user needs to do. Just the 3 most important."
6. "Does it need AI? a) Yes, it's the core (agent/chatbot) b) Yes, as complement c) No d) Not sure"
7. "Does the user upload anything? (images, docs, videos)"
8. "Need external integration? (payment, email, WhatsApp, third-party API)"

**Monetization Block:**
9. "How do you plan to monetize? a) Monthly subscription (SaaS) b) Credits/usage c) Freemium d) One-time sale e) Not defined"
10. "If SaaS, how many plans? a) Free + Pro b) Free + Pro + Enterprise c) Pay-as-you-go d) Custom"
11. "Price range? (R$ or US$)"

**Technical Block:**
12. "Stack preference or want the default recommendation? (Next.js + FastAPI + Supabase)"
13. "Mobile or web only? a) Web responsive only b) Web + PWA c) Web + Native app"

**Context Block:**
14. "Have a wireframe, image, flow, or visual reference to share?"
15. "Ideal timeline for MVP?"
16. "Anything else I should know?"

**After completion:** Compile a Discovery summary and present for user approval. If approved, advance to Stage 2.

---

## 🦁 Stage 2: PRD — Product Requirements

Based on Discovery, generate SECTION BY SECTION, asking approval for each:

### Section 2.1: User Stories
- Format: "As [persona], I want [action], so that [benefit]"
- Include measurable acceptance criteria
- Ask: "Do these user stories cover the solution? Want to adjust any?"

### Section 2.2: Functional Requirements
- Group by domain: Auth, Core Features, Dashboard, Billing
- Ask: "Missing any functionality? Anything to remove?"

### Section 2.3: Non-Functional Requirements
- Security (RLS, iron-session, CORS, rate limiting)
- Performance (< 500ms, streaming, pagination)
- UX (dark mode, loading states, responsive)
- Ask: "Any specific performance or security requirements?"

**After completion:** Present full Stage 2 summary and ask for approval.

---

## 🦁 Stage 3: Database — Schema Modeling

Refinement questions:
1. "Based on the PRD, I identified these entities: [list]. Missing any?"
2. For each ambiguous entity: "Should field [X] be free text, fixed select, or flexible JSONB?"
3. "Need soft delete (mark as deleted) or hard delete (actually remove)?"
4. "Does any entity need history/versioning?"

After questions, generate:
- Table list with fields, types, and relations
- RLS policies (SELECT, INSERT, UPDATE, DELETE by user_id)
- Triggers (auto-create profile, updated_at)
- Indexes on foreign keys and search fields
- Seed data (plans, etc)
- ER diagram in text

Ask: "Schema looks good? Want to adjust anything?"

---

## 🦁 Stage 4: Backend Architecture

Refinement questions:
1. "For the backend, I'll use FastAPI + Supabase. Want to add anything? (Redis cache, Qdrant for RAG, Celery for queues)"
2. If AI: "What capabilities/tools should the agent have? (scraping, image analysis, text generation, image generation)"
3. If AI: "Agent flow: prefer linear (step by step) or dynamic decisions (agent decides next step)?"
4. "AI response streaming via SSE — ok for you or prefer polling?"
5. "Any external API to integrate? (Tavily, Fal.ai, OpenAI, etc)"

After questions, define:
- Backend folder structure (organized by domain)
- Complete endpoint list (method, path, description, auth)
- Auth middleware (iron-session → proxy → X-User-Id header)
- Agent graph (if AI): nodes, transitions, state, tools
- Patterns: error handling, logging, Pydantic schemas

Ask: "Backend architecture ok?"

---

## 🦁 Stage 5: Frontend Architecture

Refinement questions:
1. "Have a visual reference? A website, screenshot, Figma link, shadcn template, or describe the style you want."
2. "Dashboard layout preference? a) Fixed sidebar + content b) Top nav + content c) Collapsible sidebar d) Surprise me"
3. "Color palette? a) Default dark mode b) Default light mode c) Auto (follows system) d) I have specific colors: [which]"
4. "Need any special component? (chat interface, drag & drop, kanban, rich text editor, image gallery)"
5. "Is a landing page necessary for MVP or just the logged-in app?"

After questions, define:
- Complete page map (App Router)
- Component tree
- API layer (fetch wrapper, hooks, SSE)
- Auth flow (iron-session + proxy + middleware)
- Design system (colors, typography, spacing)

Ask: "Frontend architecture ok?"

---

## 🦁 Stage 6: Security

Quick confirmation questions:
1. "iron-session with httpOnly + secure + sameSite=lax cookie — ok or want social OAuth (Google, GitHub)?"
2. "Rate limiting: 100 req/min per user is reasonable?"
3. "File upload: which types and max size? (e.g., images up to 5MB)"

After, generate security checklist:
- Complete session config
- Auth flow (register, login, logout, session expired)
- RLS review (all tables)
- CORS config
- Input validation
- Stripe webhook signature
- .env.example

Ask: "Security ok? Can I generate the final documents?"

---

## 🦁 Stage 7: Final Document Generation

**BEFORE GENERATING:** Re-read `docs/discovery-notes.md` completely. This file is the source of truth — use it as base, not the chat history.

### 7.1: Backend PRD → `docs/prd-backend.md`
- Product summary
- Functional requirements (backend)
- Complete database schema (SQL with RLS, triggers, indexes, seed)
- Endpoints (method, path, description, request/response)
- Agent graph (if AI) with nodes, tools, state
- Auth middleware (iron-session → proxy → X-User-Id pattern)
- External integrations
- Non-functional requirements (performance, logging, error handling)
- Security checklist (backend)
- Stack and dependencies (requirements.txt)

### 7.2: Frontend PRD → `docs/prd-frontend.md`
- Product summary
- Functional requirements (frontend/UX)
- Page map (complete App Router)
- Component tree
- Design system (colors, typography, visual references)
- Auth flow (iron-session in Next.js)
- API integration layer (proxy, hooks, SSE)
- Non-functional requirements (responsive, loading states, a11y)
- Security checklist (frontend)
- Stack and dependencies (package.json)

### 7.3: Implementation Plan → `docs/implementation-plan.md`
Break into 5-15 min tasks organized by batch:

```markdown
## Batch 1: Infrastructure
- Task 1.1: [description] | Files: [list] | Verification: [how to test]

## Batch 2: Database
- Task 2.1: Execute SQL in Supabase | File: docs/prd-backend.md (schema section)

## Batch 3: Backend Core
## Batch 4: Backend AI (if applicable)
## Batch 5: Frontend Setup
## Batch 6: Frontend Pages
## Batch 7: Frontend ↔ Backend Integration
## Batch 8: Billing
```

Each task must have: clear description, files involved, and how to verify it worked.

**After completion:** Present the 3 files and ask: "Documents generated! Want to review any before starting implementation?"

---

## Usage

```
/build-saas fitness tracking app
/build-saas AI content generator for marketers
/build-saas project management tool
```
