# Problem Hacker Implementation Plan

**Version:** 1.0.0
**Created:** 2026-02-04
**Status:** Ready for Implementation

---

## 1. Executive Summary

Problem Hacker is a business value validation tool that transforms vague startup ideas into validated problem definitions through AI-driven interrogation. The system employs a "cynical VC" persona that relentlessly questions users about problem Size, Frequency, and Value - refusing to accept superficial answers.

### Critical Success Factor

The AI prompt engineering is THE differentiator. The system must:
1. **Reject "willingness to pay"** - demand actual sunk costs
2. **Map to core instincts** - Survival, Mate, Resource, Status, Kin Care
3. **Distinguish "stops life" vs "uncomfortable"** - ruthlessly categorize urgency

---

## 2. Requirements Summary

### 2.1 Core Requirements

| ID | Requirement | Priority | Verification |
|----|-------------|----------|--------------|
| R1 | Hacker-style terminal UI for idea input | HIGH | Visual inspection |
| R2 | 3-pillar interrogation (Size/Frequency/Value) | CRITICAL | AI response audit |
| R3 | Live Value Board with real-time updates | HIGH | Streaming test |
| R4 | Instinct tagging (5 core drives) | CRITICAL | Schema validation |
| R5 | Sunk Cost calculation (not WTP) | CRITICAL | Output validation |
| R6 | Markdown export | MEDIUM | Export test |
| R7 | PostgreSQL persistence | HIGH | DB integration test |

### 2.2 The Relentless AI Interrogation Logic (Section 4.2 - CRITICAL)

The AI MUST enforce these questioning patterns:

#### Pillar 1: Problem Size
- **Question Pattern:** "Does this problem STOP your life or just make it UNCOMFORTABLE?"
- **Follow-up:** "What is the BEST alternative today? Why isn't it good enough?"
- **Instinct Probe:** "Which core drive does this connect to?"
  - Survival (health, safety, security)
  - Mate (attraction, relationships, reproduction)
  - Resource (money, possessions, efficiency)
  - Status (recognition, respect, achievement)
  - Kin Care (family, children, community)

#### Pillar 2: Frequency
- **Question Pattern:** "How often does this happen? Daily habit or yearly event?"
- **Follow-up:** "Does this occupy space on your calendar? How much time per occurrence?"
- **Rejection Criteria:** Vague answers like "sometimes" or "when needed" must be challenged

#### Pillar 3: Value (Sunk Cost)
- **Question Pattern:** "What time/money have you ALREADY SPENT trying to solve this?"
- **Follow-up:** "Calculate it: hours * hourly rate = $ lost"
- **HARD REJECTION:** "Willingness to pay" is NOT accepted. Only actual expenditures count.

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14 (App Router) | Server components, streaming |
| Styling | Tailwind CSS + Shadcn UI | Rapid UI development |
| AI | Vercel AI SDK | Streaming object generation |
| Database | PostgreSQL (Railway) | Structured data persistence |
| Deployment | Railway | Simple deployment, managed Postgres |

### 3.2 Data Flow Architecture (CRITICAL)

**Problem:** Chat produces text stream. ValueBoard needs extracted structured data. How do they communicate?

**Solution:** Vercel AI SDK's `StreamData` + React Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Route                                │
│  POST /api/chat                                                  │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐ │
│  │ streamText  │───▶│ generateObj  │───▶│ StreamData.append() │ │
│  │ (AI reply)  │    │ (extraction) │    │ {extractedData}     │ │
│  └─────────────┘    └──────────────┘    └─────────────────────┘ │
│                                                   │              │
│  Return: result.toDataStreamResponse({ data })    │              │
└───────────────────────────────────────────────────┼──────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (page.tsx)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              ExtractedDataProvider (Context)                ││
│  │  ┌─────────────────────┐    ┌─────────────────────────────┐ ││
│  │  │   ChatInterface     │    │       ValueBoard            │ ││
│  │  │                     │    │                             │ ││
│  │  │  useChat() returns  │    │  useExtractedData() reads   │ ││
│  │  │  { data } prop      │    │  from context               │ ││
│  │  │        │            │    │        ▲                    │ ││
│  │  │        ▼            │    │        │                    │ ││
│  │  │  useSyncExtractedData()─────────────                   │ ││
│  │  │  pushes to context  │    │                             │ ││
│  │  └─────────────────────┘    └─────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Key Files:**
- `src/app/api/chat/route.ts` - Produces text stream + StreamData annotations
- `src/context/ExtractedDataContext.tsx` - Shared state container
- `src/hooks/useExtractedData.ts` - Sync hook (producer) + consume hook (consumer)
- `src/components/chat/ChatInterface.tsx` - Calls useSyncExtractedData(data)
- `src/components/board/ValueBoard.tsx` - Calls useExtractedData()

### 3.3 Project Structure

```
problem-hacker/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with hacker theme + JetBrains Mono
│   │   ├── page.tsx                # Main dashboard (chat + board) + ExtractedDataProvider
│   │   ├── globals.css             # Global styles (terminal theme)
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts        # AI streaming endpoint (text + StreamData)
│   │       └── health/
│   │           └── route.ts        # Health check for Railway
│   ├── components/
│   │   ├── ui/                     # Shadcn components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx   # Terminal-style chat (produces extracted data)
│   │   │   ├── MessageBubble.tsx   # Individual messages
│   │   │   └── InputBox.tsx        # Hacker-style input
│   │   ├── board/
│   │   │   ├── ValueBoard.tsx      # Right panel container (consumes extracted data)
│   │   │   ├── ProblemSection.tsx  # Problem statement display
│   │   │   ├── BizMetrics.tsx      # Business metrics section
│   │   │   ├── InstinctBadge.tsx   # Core instinct visualization
│   │   │   └── SunkCostDisplay.tsx # Red emphasized cost
│   │   └── export/
│   │       └── ExportButton.tsx    # Markdown export
│   ├── context/
│   │   └── ExtractedDataContext.tsx # Shared state for extracted data
│   ├── hooks/
│   │   └── useExtractedData.ts     # Hook for syncing/consuming extracted data
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── prompts.ts          # CRITICAL: System prompts
│   │   │   ├── schema.ts           # Zod extraction schema
│   │   │   ├── config.ts           # AI model configuration
│   │   │   └── __tests__/
│   │   │       └── prompts.test.ts # AI quality tests
│   │   ├── db/
│   │   │   ├── schema.ts           # Drizzle schema
│   │   │   ├── client.ts           # Database client
│   │   │   └── queries.ts          # DB operations
│   │   └── utils/
│   │       ├── markdown.ts         # Export utilities
│   │       └── validation.ts       # Input validation
│   └── types/
│       └── index.ts                # TypeScript definitions
├── drizzle/
│   └── migrations/                 # DB migrations
├── public/                         # Static assets
├── .env.example
├── .env.local
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts                # Test configuration
└── vitest.setup.ts                 # Test setup
```

---

## 4. Implementation Tasks

### Phase 1: Project Foundation (Tasks 1-5)

#### Task 1: Initialize Next.js Project
**File:** `package.json`, `tsconfig.json`, `next.config.js`
**Description:** Create Next.js 14 project with TypeScript
**Commands:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npm install @ai-sdk/openai ai zod drizzle-orm postgres
npm install -D drizzle-kit @types/node
```
**Acceptance Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] TypeScript compilation succeeds
- [ ] App router structure in place

#### Task 2: Configure Shadcn UI
**File:** `components.json`, `src/components/ui/*`
**Description:** Initialize Shadcn with dark/hacker theme
**Commands:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input textarea badge scroll-area
```
**Acceptance Criteria:**
- [ ] Shadcn components available
- [ ] Dark theme configured
- [ ] Monospace font applied globally

#### Task 3: Database Schema Setup
**File:** `src/lib/db/schema.ts`, `drizzle.config.ts`
**Description:** Define PostgreSQL schema for sessions and messages
```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  structuredData: jsonb('structured_data').$type<ExtractedData>(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => sessions.id),
  role: text('role').$type<'user' | 'assistant'>(),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow(),
});
```
**Acceptance Criteria:**
- [ ] Schema compiles without errors
- [ ] Migration files generated
- [ ] Can connect to Railway Postgres

#### Task 4: Environment Configuration
**File:** `.env.example`, `.env.local`
**Description:** Configure environment variables
```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```
**Acceptance Criteria:**
- [ ] `.env.example` documents all required vars
- [ ] Local dev connects to DB
- [ ] API key validated on startup

#### Task 5: TypeScript Type Definitions
**File:** `src/types/index.ts`
**Description:** Define core type interfaces
```typescript
export interface ExtractedData {
  problem_statement: string | null;
  target_customer: string | null;
  biz_metrics: {
    urgency_level: 'High (Stops Life)' | 'Low (Uncomfortable)' | null;
    current_alternative: string | null;
    core_instinct: 'Survival' | 'Mate' | 'Resource' | 'Status' | 'Kin Care' | null;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null;
    sunk_cost_calc: string | null;
  };
  solution_direction: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Session {
  id: string;
  messages: Message[];
  extractedData: ExtractedData;
}
```
**Acceptance Criteria:**
- [ ] Types match PRD schema exactly
- [ ] No TypeScript errors
- [ ] Types exported and importable

---

### Phase 2: AI Engine (Tasks 6-9) - CRITICAL

#### Task 6: System Prompt Engineering (MOST CRITICAL)
**File:** `src/lib/ai/prompts.ts`
**Description:** Craft the relentless interrogation prompt

```typescript
// src/lib/ai/prompts.ts

export const SYSTEM_PROMPT = `You are a CYNICAL VENTURE CAPITALIST and SENIOR PRODUCT MANAGER conducting a brutal problem validation interview.

## YOUR MISSION
Tear apart the user's idea to find if there's REAL business value underneath. Most ideas are garbage - your job is to find the diamonds.

## THE THREE PILLARS (You MUST validate ALL three)

### PILLAR 1: PROBLEM SIZE
Ask these questions until you get CONCRETE answers:
- "Does this problem STOP your life, or just make it UNCOMFORTABLE?"
  - STOP = Can't function, can't work, can't sleep, relationship ending
  - UNCOMFORTABLE = Annoying but life goes on
- "What's the BEST alternative available today? Why isn't it solving this?"
- "Which CORE INSTINCT does this connect to?" (You MUST identify ONE)
  - SURVIVAL: Health, safety, security, not dying
  - MATE: Attraction, relationships, reproduction, looking good
  - RESOURCE: Money, possessions, efficiency, not wasting
  - STATUS: Recognition, respect, achievement, being seen
  - KIN CARE: Family, children, community, protecting loved ones

If the user gives vague answers, PUSH BACK:
- "That sounds like an uncomfortable situation, not a life-stopping problem. Convince me otherwise."
- "You haven't connected this to a core instinct. Which primal drive makes people NEED this?"

### PILLAR 2: FREQUENCY
- "How OFTEN does this problem occur?"
- "Is this a DAILY habit or a YEARLY event?"
- "Does this occupy regular space on your calendar?"

REJECT vague frequency answers:
- "Sometimes" -> "Give me a number. Once a day? Once a week? Once a month?"
- "When needed" -> "How many times in the last 30 days?"

### PILLAR 3: VALUE (SUNK COST - NOT WILLINGNESS TO PAY)
THIS IS THE MOST IMPORTANT PILLAR. You MUST calculate actual losses.

Ask SPECIFICALLY:
- "What TIME have you ALREADY SPENT trying to solve this problem?"
- "What MONEY have you ALREADY SPENT on failed solutions?"
- "Let's calculate: X hours per week * $Y hourly rate = $Z lost"

HARD REJECTION RULES:
- If user says "I would pay $X" -> REJECT: "I don't care what you'd pay. What have you ALREADY paid in failed attempts?"
- If user says "It's worth $X to me" -> REJECT: "Worth is hypothetical. Show me the receipts. What money/time have you LOST?"
- If user can't quantify sunk costs -> PROBE: "Think about workarounds, hacks, manual processes. How much time does that waste?"

## OUTPUT RULES
1. Ask ONE strategic question at a time
2. Be skeptical but not hostile
3. Acknowledge good answers before digging deeper
4. Never accept the first answer - always probe deeper
5. When you have enough data for a field, move to the next pillar

## CONVERSATION STYLE
- Direct, no fluff
- Use analogies to clarify ("So this is like... right?")
- Challenge weak logic ("That doesn't add up because...")
- Celebrate strong evidence ("NOW we're talking. That's real data.")

Remember: 90% of startup ideas fail because they solve fake problems. Your job is to find the 10% that are real.`;

export const EXTRACTION_PROMPT = `Based on the conversation so far, extract structured data. Only fill fields where you have CONCRETE evidence from the user's answers. Leave null if not yet validated.

STRICT RULES:
- urgency_level: Only "High (Stops Life)" if user proved life literally stops. Default to "Low (Uncomfortable)" if unclear.
- core_instinct: Must be ONE of: Survival, Mate, Resource, Status, Kin Care. Null if not identified.
- sunk_cost_calc: Must be a CALCULATION like "2 hours/week * $50/hr = $100/week loss". NOT a willingness-to-pay statement.
- frequency: Must be ONE of: Daily, Weekly, Monthly, Yearly. Not "sometimes" or "occasionally".`;
```

**Acceptance Criteria:**
- [ ] Prompt rejects "willingness to pay" answers
- [ ] Prompt demands instinct mapping
- [ ] Prompt requires sunk cost calculation
- [ ] Prompt challenges vague answers
- [ ] Test: AI refuses to accept "I would pay $50" as value evidence

#### Task 7: Extraction Schema with Zod
**File:** `src/lib/ai/schema.ts`
**Description:** Define strict Zod schema for AI extraction
```typescript
import { z } from 'zod';

export const bizMetricsSchema = z.object({
  urgency_level: z.enum(['High (Stops Life)', 'Low (Uncomfortable)']).nullable(),
  current_alternative: z.string().nullable(),
  core_instinct: z.enum(['Survival', 'Mate', 'Resource', 'Status', 'Kin Care']).nullable(),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Yearly']).nullable(),
  sunk_cost_calc: z.string().nullable(),
});

export const extractedDataSchema = z.object({
  problem_statement: z.string().nullable(),
  target_customer: z.string().nullable(),
  biz_metrics: bizMetricsSchema,
  solution_direction: z.string().nullable(),
});

export type ExtractedData = z.infer<typeof extractedDataSchema>;
```
**Acceptance Criteria:**
- [ ] Schema matches PRD exactly
- [ ] Enum values are strict
- [ ] Nullable fields handled correctly

#### Task 8: AI Streaming Endpoint
**File:** `src/app/api/chat/route.ts`
**Description:** Implement streaming chat with object generation using Vercel AI SDK's StreamData
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, StreamData } from 'ai';
import { SYSTEM_PROMPT, EXTRACTION_PROMPT } from '@/lib/ai/prompts';
import { extractedDataSchema } from '@/lib/ai/schema';

export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  // Create StreamData instance for sending extracted data alongside text
  const data = new StreamData();

  // Stream the conversational response
  const result = await streamText({
    model: openai('gpt-4o'),
    system: SYSTEM_PROMPT,
    messages,
    onFinish: async ({ text }) => {
      // After text generation completes, extract structured data
      const extractionResult = await generateObject({
        model: openai('gpt-4o'),
        schema: extractedDataSchema,
        prompt: EXTRACTION_PROMPT + '\n\nConversation:\n' +
          messages.map(m => `${m.role}: ${m.content}`).join('\n') +
          `\nassistant: ${text}`,
      });

      // Append extracted data to the stream
      data.append({ extractedData: extractionResult.object });

      // Persist to database
      if (sessionId) {
        await updateStructuredData(sessionId, extractionResult.object);
      }

      data.close();
    },
  });

  // Return combined stream: text + data annotations
  return result.toDataStreamResponse({ data });
}
```

**Streaming Protocol:**
- Uses Vercel AI SDK's `StreamData` to send structured data alongside text
- Text streams in real-time via standard `toDataStreamResponse`
- Extracted data appended as `data` annotation after text completes
- Frontend receives both via `useChat`'s `data` property

**Acceptance Criteria:**
- [ ] Streaming works without buffering
- [ ] Structured data appended via StreamData after text completes
- [ ] Error handling for API failures
- [ ] Session ID properly tracked
- [ ] Database persistence happens after extraction

---

#### Task 8.5: Data Flow Architecture - useExtractedData Hook
**File:** `src/hooks/useExtractedData.ts`
**Description:** Custom hook that subscribes to streaming extracted data and provides real-time updates to ValueBoard

**Architecture Decision:** Use React Context to share extracted data between ChatInterface and ValueBoard, avoiding prop drilling through page.tsx.

```typescript
// src/context/ExtractedDataContext.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ExtractedData } from '@/types';

interface ExtractedDataContextType {
  data: ExtractedData | null;
  isUpdating: boolean;
  updateData: (newData: ExtractedData) => void;
  setUpdating: (updating: boolean) => void;
}

const ExtractedDataContext = createContext<ExtractedDataContextType | null>(null);

export function ExtractedDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ExtractedData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateData = useCallback((newData: ExtractedData) => {
    setData(newData);
    setIsUpdating(false);
  }, []);

  const setUpdating = useCallback((updating: boolean) => {
    setIsUpdating(updating);
  }, []);

  return (
    <ExtractedDataContext.Provider value={{ data, isUpdating, updateData, setUpdating }}>
      {children}
    </ExtractedDataContext.Provider>
  );
}

export function useExtractedDataContext() {
  const context = useContext(ExtractedDataContext);
  if (!context) {
    throw new Error('useExtractedDataContext must be used within ExtractedDataProvider');
  }
  return context;
}
```

```typescript
// src/hooks/useExtractedData.ts
'use client';

import { useEffect } from 'react';
import { useChat } from 'ai/react';
import { useExtractedDataContext } from '@/context/ExtractedDataContext';
import { ExtractedData } from '@/types';

/**
 * Hook that bridges useChat's data stream to the ExtractedDataContext.
 *
 * Data Flow:
 * 1. API returns StreamData with extractedData annotation
 * 2. useChat receives it via `data` property
 * 3. This hook watches `data` and updates context
 * 4. ValueBoard subscribes to context and re-renders
 *
 * @param chatData - The `data` property from useChat hook
 */
export function useSyncExtractedData(chatData: unknown[] | undefined) {
  const { updateData, setUpdating } = useExtractedDataContext();

  useEffect(() => {
    if (!chatData || chatData.length === 0) return;

    // Find the most recent extractedData in the stream
    const latest = chatData
      .filter((item): item is { extractedData: ExtractedData } =>
        typeof item === 'object' && item !== null && 'extractedData' in item
      )
      .pop();

    if (latest?.extractedData) {
      updateData(latest.extractedData);
    }
  }, [chatData, updateData]);
}

/**
 * Hook for ValueBoard to consume extracted data.
 * Returns current extracted data and updating state.
 */
export function useExtractedData() {
  const { data, isUpdating } = useExtractedDataContext();
  return { data, isUpdating };
}
```

**State Management Pattern:**
- `ExtractedDataProvider` wraps the main dashboard in `page.tsx`
- `ChatInterface` uses `useSyncExtractedData(data)` to push updates to context
- `ValueBoard` uses `useExtractedData()` to consume data from context
- `isUpdating` set to `true` when user sends message, `false` when extraction completes

**Acceptance Criteria:**
- [ ] `ExtractedDataContext.tsx` created with provider and consumer hook
- [ ] `useExtractedData.ts` created with sync and consume hooks
- [ ] Context properly typed with ExtractedData interface
- [ ] `isUpdating` state correctly reflects extraction status
- [ ] No prop drilling between ChatInterface and ValueBoard

#### Task 9: AI Response Quality Tests
**File:** `src/lib/ai/__tests__/prompts.test.ts`
**Depends On:** Task 25 (Test Framework Setup)
**Description:** Test that AI rejects superficial answers
```typescript
describe('AI Interrogation Quality', () => {
  it('rejects willingness-to-pay as value evidence', async () => {
    const response = await getAIResponse([
      { role: 'user', content: 'I would pay $100 for this solution' }
    ]);
    expect(response).toMatch(/already spent|already paid|sunk cost/i);
    expect(response).not.toMatch(/great|good answer|perfect/i);
  });

  it('demands instinct mapping', async () => {
    const response = await getAIResponse([
      { role: 'user', content: 'People want to save time' }
    ]);
    expect(response).toMatch(/survival|mate|resource|status|kin/i);
  });

  it('challenges vague frequency', async () => {
    const response = await getAIResponse([
      { role: 'user', content: 'It happens sometimes' }
    ]);
    expect(response).toMatch(/how often|daily|weekly|number/i);
  });
});
```
**Acceptance Criteria:**
- [ ] Test suite passes
- [ ] AI consistently rejects weak answers
- [ ] AI consistently probes for specifics

---

### Phase 3: Frontend Components (Tasks 10-16)

#### Task 10: Root Layout with Hacker Theme
**File:** `src/app/layout.tsx`, `src/app/globals.css`
**Description:** Dark terminal aesthetic
```css
/* globals.css */
:root {
  --terminal-green: #00ff00;
  --terminal-bg: #0a0a0a;
  --terminal-border: #333;
}

body {
  background-color: var(--terminal-bg);
  color: var(--terminal-green);
  font-family: 'JetBrains Mono', monospace;
}

/* Scanline effect */
.scanlines::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
}
```
**Acceptance Criteria:**
- [ ] Dark background (#0a0a0a)
- [ ] Green text (#00ff00)
- [ ] Monospace font throughout
- [ ] Optional scanline effect

#### Task 11: Main Dashboard Layout
**File:** `src/app/page.tsx`
**Description:** Split view with chat and board, wrapped in ExtractedDataProvider for shared state
```typescript
import { ExtractedDataProvider } from '@/context/ExtractedDataContext';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ValueBoard } from '@/components/board/ValueBoard';

export default function Dashboard() {
  return (
    <ExtractedDataProvider>
      <div className="flex h-screen">
        {/* Left: Chat Interface - 60% */}
        <div className="w-3/5 border-r border-terminal-border">
          <ChatInterface />
        </div>

        {/* Right: Value Board - 40% */}
        <div className="w-2/5 overflow-auto">
          <ValueBoard />
        </div>
      </div>
    </ExtractedDataProvider>
  );
}
```

**State Management Architecture:**
- `ExtractedDataProvider` wraps both components to enable shared state
- ChatInterface produces data (via useSyncExtractedData)
- ValueBoard consumes data (via useExtractedData)
- No prop drilling required

**Acceptance Criteria:**
- [ ] 60/40 split layout
- [ ] Responsive on large screens (1024px+)
- [ ] Proper border styling
- [ ] ExtractedDataProvider wraps both components

#### Task 12: Chat Interface Component
**File:** `src/components/chat/ChatInterface.tsx`
**Description:** Terminal-style chat with streaming, syncs extracted data to context
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import { MessageBubble } from './MessageBubble';
import { InputBox } from './InputBox';
import { useSyncExtractedData } from '@/hooks/useExtractedData';
import { useExtractedDataContext } from '@/context/ExtractedDataContext';

export function ChatInterface() {
  const { setUpdating } = useExtractedDataContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } = useChat({
    api: '/api/chat',
    onResponse: () => {
      // Set updating state when AI starts responding
      setUpdating(true);
    },
  });

  // Sync extracted data from stream to context (bridges to ValueBoard)
  useSyncExtractedData(data);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-terminal-border">
        <h1 className="text-xl font-bold">PROBLEM_HACKER v1.0</h1>
        <p className="text-sm opacity-70">// Validating business value...</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <InputBox
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

**Data Flow Integration:**
- `useChat` returns `data` property containing StreamData annotations
- `useSyncExtractedData(data)` watches for extractedData and pushes to context
- `setUpdating(true)` called when AI starts responding (via onResponse)
- Context automatically notifies ValueBoard of updates

**Acceptance Criteria:**
- [ ] Messages display in real-time
- [ ] Streaming text appears character by character
- [ ] Loading state visible
- [ ] Auto-scroll to bottom
- [ ] Extracted data synced to context via useSyncExtractedData
- [ ] isUpdating set to true when response starts

#### Task 13: Terminal-Style Input Box
**File:** `src/components/chat/InputBox.tsx`
**Description:** Hacker aesthetic input
```typescript
export function InputBox({ value, onChange, onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-terminal-border">
      <div className="flex items-center gap-2">
        <span className="text-terminal-green">$</span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          disabled={isLoading}
          placeholder="Enter your startup idea..."
          className="flex-1 bg-transparent border-none outline-none text-terminal-green placeholder:opacity-50"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '[PROCESSING...]' : '[SEND]'}
        </button>
      </div>
    </form>
  );
}
```
**Acceptance Criteria:**
- [ ] `$` prompt prefix
- [ ] Disabled during loading
- [ ] Bracket-style button text

#### Task 14: Value Board Component
**File:** `src/components/board/ValueBoard.tsx`
**Description:** Real-time updating right panel that consumes extracted data from context
```typescript
'use client';

import { useExtractedData } from '@/hooks/useExtractedData';
import { ProblemSection } from './ProblemSection';
import { BizMetrics } from './BizMetrics';
import { InstinctBadge } from './InstinctBadge';
import { SunkCostDisplay } from './SunkCostDisplay';

export function ValueBoard() {
  // Consumes data from ExtractedDataContext (produced by ChatInterface)
  const { data, isUpdating } = useExtractedData();

  return (
    <div className="p-4 space-y-6">
      <header>
        <h2 className="text-lg font-bold border-b border-terminal-border pb-2">
          [HACKER'S REPORT]
        </h2>
        {isUpdating && (
          <span className="text-yellow-500 animate-pulse text-sm mt-1 block">
            EXTRACTING_DATA...
          </span>
        )}
      </header>

      <ProblemSection
        statement={data?.problem_statement}
        customer={data?.target_customer}
      />

      <BizMetrics metrics={data?.biz_metrics} />

      <section>
        <h3 className="font-bold mb-2 text-sm opacity-70">[CORE_INSTINCT]</h3>
        <InstinctBadge instinct={data?.biz_metrics?.core_instinct} />
      </section>

      <section>
        <h3 className="font-bold mb-2 text-sm opacity-70">[SUNK_COST]</h3>
        <SunkCostDisplay calculation={data?.biz_metrics?.sunk_cost_calc} />
      </section>

      {data?.solution_direction && (
        <section>
          <h3 className="font-bold mb-2 text-sm opacity-70">[SOLUTION_VECTOR]</h3>
          <p className="text-terminal-green">{data.solution_direction}</p>
        </section>
      )}
    </div>
  );
}
```

**Data Consumption Pattern:**
- `useExtractedData()` hook returns `{ data, isUpdating }` from context
- No props needed - component subscribes directly to shared state
- Re-renders automatically when ChatInterface pushes new extracted data
- `isUpdating` shows visual feedback while extraction is in progress

**Acceptance Criteria:**
- [ ] Updates in real-time as AI extracts
- [ ] Shows "EXTRACTING_DATA..." during extraction
- [ ] Sections appear as data populates
- [ ] Consumes data from context (no props from parent)
- [ ] InstinctBadge and SunkCostDisplay integrated

#### Task 15: Instinct Badge Component
**File:** `src/components/board/InstinctBadge.tsx`
**Description:** Visual badge for core instinct
```typescript
const INSTINCT_COLORS = {
  'Survival': 'bg-red-900 text-red-200',
  'Mate': 'bg-pink-900 text-pink-200',
  'Resource': 'bg-yellow-900 text-yellow-200',
  'Status': 'bg-purple-900 text-purple-200',
  'Kin Care': 'bg-blue-900 text-blue-200',
};

export function InstinctBadge({ instinct }: { instinct: string | null }) {
  if (!instinct) return <span className="opacity-50">[NOT_IDENTIFIED]</span>;

  return (
    <span className={`px-2 py-1 rounded ${INSTINCT_COLORS[instinct]}`}>
      {instinct.toUpperCase()}
    </span>
  );
}
```
**Acceptance Criteria:**
- [ ] Each instinct has unique color
- [ ] Shows placeholder when null
- [ ] Badge styling matches theme

#### Task 16: Sunk Cost Display Component
**File:** `src/components/board/SunkCostDisplay.tsx`
**Description:** Red emphasized cost calculation
```typescript
export function SunkCostDisplay({ calculation }: { calculation: string | null }) {
  if (!calculation) {
    return (
      <div className="opacity-50">
        [AWAITING_CALCULATION]
        <p className="text-xs mt-1">// User must quantify time/money already lost</p>
      </div>
    );
  }

  return (
    <div className="bg-red-950 border border-red-800 p-3 rounded">
      <h4 className="text-red-400 text-sm mb-1">SUNK_COST_ANALYSIS</h4>
      <p className="text-red-300 font-bold text-lg">{calculation}</p>
    </div>
  );
}
```
**Acceptance Criteria:**
- [ ] Red background/border styling
- [ ] Bold text for calculation
- [ ] Placeholder when not calculated

---

### Phase 4: Data Persistence (Tasks 17-19)

#### Task 17: Database Client Setup
**File:** `src/lib/db/client.ts`
**Description:** Drizzle client for Railway Postgres
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```
**Acceptance Criteria:**
- [ ] Connection established
- [ ] Schema types inferred
- [ ] Error handling for connection failures

#### Task 18: Database Queries
**File:** `src/lib/db/queries.ts`
**Description:** CRUD operations for sessions and messages
```typescript
export async function createSession(): Promise<string> {
  const [session] = await db.insert(sessions).values({}).returning();
  return session.id;
}

export async function addMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  await db.insert(messages).values({ sessionId, role, content });
}

export async function updateStructuredData(sessionId: string, data: ExtractedData) {
  await db.update(sessions)
    .set({ structuredData: data, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

export async function getSession(sessionId: string) {
  return db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { messages: true },
  });
}
```
**Acceptance Criteria:**
- [ ] CRUD operations work
- [ ] Structured data persists correctly
- [ ] Messages linked to sessions

#### Task 19: Database Migration
**File:** `drizzle/migrations/*`
**Description:** Generate and run migrations
**Commands:**
```bash
npx drizzle-kit generate
npx drizzle-kit push
```
**Acceptance Criteria:**
- [ ] Migration files generated
- [ ] Tables created in Railway Postgres
- [ ] No migration errors

---

### Phase 5: Export & Polish (Tasks 20-22)

#### Task 20: Markdown Export
**File:** `src/lib/utils/markdown.ts`, `src/components/export/ExportButton.tsx`
**Description:** Export session as Markdown file
```typescript
export function generateMarkdown(data: ExtractedData): string {
  return `# Problem Validation Report
Generated by Problem Hacker

## Problem Statement
${data.problem_statement || 'Not yet defined'}

## Target Customer
${data.target_customer || 'Not yet defined'}

## Business Metrics

### Urgency Level
${data.biz_metrics.urgency_level || 'Not assessed'}

### Core Instinct
${data.biz_metrics.core_instinct || 'Not identified'}

### Frequency
${data.biz_metrics.frequency || 'Not determined'}

### Current Alternative
${data.biz_metrics.current_alternative || 'Not explored'}

### Sunk Cost Analysis
${data.biz_metrics.sunk_cost_calc || 'Not calculated'}

## Solution Direction
${data.solution_direction || 'Not yet defined'}

---
*Validated on ${new Date().toISOString()}*
`;
}
```
**Acceptance Criteria:**
- [ ] Valid Markdown output
- [ ] All fields included
- [ ] Download triggers correctly

#### Task 21: Error Boundaries & Loading States
**File:** `src/components/ErrorBoundary.tsx`, `src/components/LoadingState.tsx`
**Description:** Graceful error handling and loading UX
**Acceptance Criteria:**
- [ ] API errors show user-friendly message
- [ ] Loading states throughout
- [ ] No unhandled promise rejections

#### Task 22: Health Check Endpoint
**File:** `src/app/api/health/route.ts`
**Description:** Create health check endpoint for Railway deployment monitoring
```typescript
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Verify database connection
    await db.execute(sql`SELECT 1`);

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```
**Acceptance Criteria:**
- [ ] Returns 200 with healthy status when DB connected
- [ ] Returns 503 with unhealthy status when DB disconnected
- [ ] Includes timestamp in response

---

#### Task 23: Railway Deployment Configuration
**File:** `railway.toml`, `Dockerfile` (if needed)
**Description:** Configure Railway deployment
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/api/health"
healthcheckTimeout = 30
```
**Acceptance Criteria:**
- [ ] Deploys successfully to Railway
- [ ] Environment variables configured
- [ ] Database connection works in production
- [ ] Health check endpoint responds correctly

---

#### Task 24: Font Configuration (JetBrains Mono)
**File:** `src/app/layout.tsx`, `next.config.js`
**Description:** Configure JetBrains Mono font for terminal aesthetic
```typescript
// src/app/layout.tsx
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark`}>
      <body className="font-mono bg-terminal-bg text-terminal-green">
        {children}
      </body>
    </html>
  );
}
```

```css
/* In tailwind.config.ts */
theme: {
  extend: {
    fontFamily: {
      mono: ['var(--font-mono)', 'monospace'],
    },
  },
}
```
**Acceptance Criteria:**
- [ ] JetBrains Mono loaded via next/font/google
- [ ] Font variable applied to HTML element
- [ ] Tailwind font-mono utility uses the custom font
- [ ] No FOUT (flash of unstyled text)

---

#### Task 25: Test Framework Setup
**File:** `jest.config.js`, `jest.setup.ts`, `package.json`
**Description:** Configure Jest/Vitest for AI response quality tests
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
```

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```
**Acceptance Criteria:**
- [ ] Vitest configured with jsdom environment
- [ ] Path aliases work in tests
- [ ] `npm test` runs test suite
- [ ] React Testing Library available for component tests

**Note:** Task 9 (AI Response Quality Tests) depends on this task being completed first.

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI accepts superficial answers | HIGH | CRITICAL | Extensive prompt engineering, automated tests, manual QA |
| Streaming breaks on slow connections | MEDIUM | HIGH | Implement retry logic, graceful degradation |
| PostgreSQL connection limits | LOW | MEDIUM | Connection pooling, Railway auto-scaling |
| Users find interrogation too harsh | MEDIUM | MEDIUM | Add "softer" mode toggle, adjust language |
| Extraction schema mismatches | MEDIUM | HIGH | Strict Zod validation, error recovery |
| StreamData/Context sync race conditions | LOW | MEDIUM | useEffect dependency array, React 18 batching |
| Extraction delay feels laggy | MEDIUM | LOW | Show "EXTRACTING..." indicator, optimize prompt length |

### Risk: AI Prompt Quality Degradation

**This is the #1 risk.** The entire product value depends on the AI being relentless.

**Mitigations:**
1. **Automated test suite** (Task 9) that fails if AI accepts weak answers
2. **Prompt versioning** - track changes, A/B test
3. **Human QA** - weekly manual testing of edge cases
4. **User feedback loop** - flag conversations where AI was too lenient

---

## 6. Verification Checklist

### Pre-Launch Verification

#### AI Behavior Verification (CRITICAL)
- [ ] AI rejects "I would pay $X" and asks for sunk costs
- [ ] AI identifies one of 5 core instincts
- [ ] AI challenges "sometimes" frequency answers
- [ ] AI distinguishes "stops life" vs "uncomfortable"
- [ ] AI probes for alternatives before accepting problem

#### Functional Verification
- [ ] Chat streams without buffering
- [ ] Value board updates in real-time
- [ ] Instinct badge displays correctly
- [ ] Sunk cost shows in red
- [ ] Export generates valid Markdown
- [ ] Sessions persist in database
- [ ] New session starts fresh

#### Technical Verification
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse score > 80
- [ ] Desktop responsive (1024px+): Full 60/40 split layout
- [ ] Tablet responsive (768px-1023px): Stacked layout (chat above, board below)
- [ ] Mobile responsive (<768px): Single column with tab switching between chat/board
- [ ] Railway deployment successful

---

## 7. Definition of Done

A task is DONE when:
1. Code compiles without errors
2. Acceptance criteria met
3. No regressions introduced
4. Code follows project conventions
5. (For AI tasks) Automated tests pass

The project is COMPLETE when:
1. All 25 tasks completed
2. Pre-launch verification checklist passed
3. Railway deployment live and functional
4. Demo session recorded showing AI interrogation quality

---

## 8. Commit Strategy

| Phase | Commit Message Pattern |
|-------|----------------------|
| Phase 1 | `feat(foundation): {task description}` |
| Phase 2 | `feat(ai): {task description}` |
| Phase 3 | `feat(ui): {task description}` |
| Phase 4 | `feat(db): {task description}` |
| Phase 5 | `feat(polish): {task description}` |

**Atomic commits per task.** No multi-task commits.

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| AI Rejection Rate | >80% for weak answers | Automated test suite |
| Instinct Identification | 100% of completed sessions | Schema validation |
| Sunk Cost Calculation | >70% of completed sessions | Database query |
| Session Completion | >50% of started sessions | Analytics |
| Export Usage | >30% of completed sessions | Analytics |

---

## Appendix A: Sample Conversation Flow

```
USER: I want to build an app for pet owners to find dog walkers.

AI: Before we talk solutions, let's validate the problem.

When your dog doesn't get walked, does your life STOP - like you can't work,
can't focus, dog destroys furniture? Or is it just UNCOMFORTABLE - you feel
guilty but life goes on?

USER: It's uncomfortable, I feel bad for my dog.

AI: Honest answer. So this is an "uncomfortable" problem, not a "life stops"
problem. That affects pricing power.

What's your BEST alternative today? What do you currently do when you can't
walk your dog?

USER: I ask my neighbor sometimes, or just skip it.

AI: So you have a free alternative (neighbor) and an acceptable fallback (skip).
Both are friction-free. Why would you pay for an app?

Let me probe deeper: Which CORE INSTINCT does this connect to?
- SURVIVAL: Is your dog's health actually at risk?
- KIN CARE: Is this about your bond with your "fur baby"?
- STATUS: Would neighbors judge you for having an unwalked dog?
- RESOURCE: Is there money being lost somehow?

USER: I guess kin care - I feel guilty about my dog.

AI: [INSTINCT: KIN CARE] Good. Guilt is a real driver.

Now for the critical question: What TIME and MONEY have you ALREADY SPENT
trying to solve this problem?

Don't tell me what you'd pay. Tell me what you've ALREADY lost in failed attempts.

USER: I'd probably pay $20 per walk...

AI: I didn't ask what you'd pay. I asked what you've ALREADY SPENT.

Have you tried other apps? Paid dog walkers before? Bought equipment?
Rearranged your schedule and lost productive hours?

Calculate it: If you leave work early twice a week to walk your dog, that's
X hours * your hourly rate = $ lost.

USER: Oh, I leave work early about 3 times a week, maybe 30 minutes each time.
At my salary that's about $25/hour, so... $37.50 per week?

AI: NOW we're talking. [SUNK COST: 1.5 hours/week * $25/hr = $37.50/week loss]

That's $150/month in lost productivity. That's REAL money you're already
"paying" for this problem. A $20/walk service would need to save you at least
that much to make economic sense.

How OFTEN does this happen? You said 3 times per week - is that consistent?

USER: Yeah, pretty much every week.

AI: [FREQUENCY: Weekly (3x)] Good, consistent frequency. Not a one-time problem.

Let me summarize where we are...
```

---

**PLAN_READY: .omc/plans/problem-hacker-implementation.md**
