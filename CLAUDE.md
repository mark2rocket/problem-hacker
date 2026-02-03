# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Problem Hacker is a business value validation tool that transforms vague startup ideas into validated problem definitions through AI-driven interrogation. The system employs a "cynical VC" persona that relentlessly questions users about problem Size, Frequency, and Value - refusing to accept superficial answers.

**Tech Stack:**
- Next.js 14 (App Router)
- Vercel AI SDK for streaming + object generation
- PostgreSQL via Drizzle ORM
- Tailwind CSS + Shadcn UI (hacker/terminal theme)
- Deployment: Railway

## Critical Success Factor: AI Prompt Engineering

The AI prompt in `src/lib/ai/prompts.ts` is THE core differentiator. It must:

1. **Reject "willingness to pay"** - Only accept actual sunk costs (time/money already spent)
2. **Map to 5 core instincts** - Survival, Mate, Resource, Status, Kin Care
3. **Distinguish urgency** - "Stops life" (high) vs "Uncomfortable" (low)

**The AI MUST challenge superficial answers:**
- User: "I would pay $50" → AI: "I don't care what you'd pay. What have you ALREADY paid?"
- User: "It happens sometimes" → AI: "Give me a number. Once a day? Once a week?"
- User: "People want this" → AI: "Which core instinct makes them NEED it?"

## Development Commands

```bash
# Initial setup (from plan Task 1)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npm install @ai-sdk/openai ai zod drizzle-orm postgres
npm install -D drizzle-kit @types/node vitest @testing-library/react

# Shadcn UI setup (Task 2)
npx shadcn@latest init
npx shadcn@latest add button card input textarea badge scroll-area

# Database migrations (Task 19)
npx drizzle-kit generate
npx drizzle-kit push

# Development
npm run dev

# Build
npm run build

# Tests (Task 25)
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:ui        # Vitest UI

# Type checking
npx tsc --noEmit
```

## Architecture: Data Flow (CRITICAL)

**Problem:** ChatInterface produces text stream. ValueBoard needs extracted structured data. How do they communicate?

**Solution:** Vercel AI SDK's `StreamData` + React Context

### Flow Diagram

```
API Route (/api/chat)
├─ streamText() → conversational response
├─ generateObject() → extract structured data (after text completes)
└─ StreamData.append({ extractedData }) → send to frontend
         │
         ▼
Frontend (page.tsx wrapped in ExtractedDataProvider)
├─ ChatInterface
│  ├─ useChat() → { data } prop contains StreamData
│  └─ useSyncExtractedData(data) → pushes to context
└─ ValueBoard
   └─ useExtractedData() → reads from context
```

### Key Files for Data Flow

1. **`src/app/api/chat/route.ts`** - Produces text stream + StreamData annotations
   - Uses `StreamData` class to append extracted data
   - Returns `result.toDataStreamResponse({ data })`

2. **`src/context/ExtractedDataContext.tsx`** - Shared state container
   - Provider wraps ChatInterface + ValueBoard in page.tsx
   - Holds `data` and `isUpdating` state

3. **`src/hooks/useExtractedData.ts`** - Two hooks:
   - `useSyncExtractedData(data)` - Producer: syncs from useChat to context
   - `useExtractedData()` - Consumer: reads from context

4. **`src/components/chat/ChatInterface.tsx`** - Calls `useSyncExtractedData(data)`
   - Bridges Vercel AI SDK's `useChat` to the context

5. **`src/components/board/ValueBoard.tsx`** - Calls `useExtractedData()`
   - Reads extracted data from context and displays live

## Type System

All types in `src/types/index.ts` match the extraction schema exactly.

**Core Type:**
```typescript
interface ExtractedData {
  problem_statement: string | null;
  target_customer: string | null;
  biz_metrics: {
    urgency_level: 'High (Stops Life)' | 'Low (Uncomfortable)' | null;
    current_alternative: string | null;
    core_instinct: 'Survival' | 'Mate' | 'Resource' | 'Status' | 'Kin Care' | null;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null;
    sunk_cost_calc: string | null; // MUST be calculation, not WTP
  };
  solution_direction: string | null;
}
```

**Zod Schema:** `src/lib/ai/schema.ts` uses strict enums matching these types.

## Database Schema

PostgreSQL via Drizzle ORM. Two tables:

**sessions table:**
- `id` (uuid, PK)
- `createdAt`, `updatedAt` (timestamps)
- `structuredData` (jsonb) - stores ExtractedData

**messages table:**
- `id` (uuid, PK)
- `sessionId` (uuid, FK to sessions)
- `role` ('user' | 'assistant')
- `content` (text)
- `createdAt` (timestamp)

Schema defined in `src/lib/db/schema.ts`, queries in `src/lib/db/queries.ts`.

## Environment Variables

Required in `.env.local`:
```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

## UI/UX: Terminal/Hacker Aesthetic

**Theme Colors:**
- Background: `#0a0a0a`
- Text: `#00ff00` (terminal green)
- Font: JetBrains Mono (monospace)

**Layout:**
- 60% left: ChatInterface (terminal-style input with `$` prompt)
- 40% right: ValueBoard (live updating "Hacker's Report")

**Visual Highlights:**
- **Instinct Badge** - Color-coded by drive (red=Survival, pink=Mate, etc.)
- **Sunk Cost Display** - Red background/border with bold text emphasis

## Testing Strategy

**AI Quality Tests** (`src/lib/ai/__tests__/prompts.test.ts`):
- Verify AI rejects "willingness to pay" answers
- Verify AI demands instinct mapping
- Verify AI challenges vague frequency ("sometimes")

These tests are CRITICAL - they ensure the prompt engineering maintains quality.

**Test Framework:** Vitest + React Testing Library (configured in Task 25)

## Deployment

**Target:** Railway
- Automatic PostgreSQL provisioning
- Health check endpoint: `/api/health` (checks DB connectivity)
- Build command: `npm run build`
- Start command: `npm run start`

## Common Pitfalls to Avoid

1. **DO NOT accept "willingness to pay" in sunk cost calculations**
   - The AI must calculate actual money/time already spent
   - Example: "2 hours/week * $50/hr = $100/week loss"

2. **DO NOT allow vague frequency answers**
   - Must be one of: Daily, Weekly, Monthly, Yearly
   - Challenge "sometimes", "occasionally", "when needed"

3. **DO NOT skip instinct mapping**
   - Every validated problem MUST map to one of 5 core drives
   - This is non-negotiable for business value validation

4. **DO NOT buffer the text stream**
   - Use Vercel AI SDK's streaming properly
   - Text should appear character-by-character

5. **DO NOT prop drill extracted data**
   - Use ExtractedDataContext, not props from page.tsx
   - ChatInterface produces, ValueBoard consumes via context

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI streaming endpoint (CRITICAL)
│   ├── layout.tsx         # Root layout (theme, fonts)
│   └── page.tsx           # Dashboard (wraps in ExtractedDataProvider)
├── components/
│   ├── chat/              # Terminal-style chat UI
│   └── board/             # Value Board (live updates)
├── context/               # ExtractedDataContext for state sharing
├── hooks/                 # useExtractedData (sync + consume)
├── lib/
│   ├── ai/                # Prompts, schemas, config (CRITICAL)
│   ├── db/                # Drizzle schema, queries
│   └── utils/             # Markdown export, validation
└── types/                 # TypeScript definitions
```

## Implementation Plan

Full 25-task implementation plan available at: `.omc/plans/problem-hacker-implementation.md`

**Phases:**
1. Foundation (Tasks 1-5) - Next.js, DB, types
2. AI Engine (Tasks 6-9) - **MOST CRITICAL** - Prompt engineering
3. Frontend (Tasks 10-16) - Terminal UI, live board
4. Persistence (Tasks 17-19) - Database integration
5. Polish (Tasks 20-25) - Export, tests, deployment

**Critical Path:** Task 6 (System Prompt Engineering) is the differentiator.
