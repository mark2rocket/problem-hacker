# Problem Hacker

**Version:** 1.1.0
**Status:** Production Ready
**Live Demo:** [https://github.com/mark2rocket/problem-hacker](https://github.com/mark2rocket/problem-hacker)

## 🎯 What is Problem Hacker?

Problem Hacker is a business value validation tool that transforms vague startup ideas into validated problem definitions through AI-driven interrogation. Most founders waste resources solving fake problems or problems that don't have real business value. Problem Hacker helps you validate if your idea is worth pursuing.

### Core Value Proposition

**Logical Structure + Business Viability Check**

The AI acts as a cynical VC and senior PM, relentlessly questioning your idea across three critical dimensions:

1. **Problem Size (크기)**
   - Does this problem STOP life or just make it uncomfortable?
   - What's the best alternative available today?
   - Which CORE INSTINCT does this connect to? (Survival, Mate, Resource, Status, Kin Care)

2. **Frequency (빈도)**
   - How often does this problem occur?
   - Is this a daily habit or a yearly event?
   - Does this occupy regular space on your calendar?

3. **Value (가치) - SUNK COST ONLY**
   - What TIME have you ALREADY SPENT trying to solve this?
   - What MONEY have you ALREADY SPENT on failed solutions?
   - **REJECTS** "willingness to pay" - demands actual calculations

## 🚀 Features

### 1. AI-Driven Interrogation
- System prompt enforces relentless questioning
- Hard rejection of "willingness to pay" statements
- Demands sunk cost calculations with actual money/time spent
- Maps problems to 5 core human instincts

### 2. Real-Time Business Metrics Board
- Live updates as conversation progresses
- Visual instinct badges (Survival=red, Mate=pink, Resource=yellow, Status=purple, Kin Care=blue)
- Emphasized sunk cost display with red highlighting
- Structured problem statement and solution direction

### 3. Terminal/Hacker Aesthetic
- Cyberpunk-inspired UI (#00ff00 on #0a0a0a)
- JetBrains Mono monospace font
- Optional CRT scanline effect
- Command-line inspired interface

### 4. Data Persistence
- PostgreSQL database with Drizzle ORM
- Session and message history storage
- Structured business metrics as JSON

### 5. Export Functionality
- Download validated problem definition as Markdown
- Share with team or investors

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **UI Components:** Shadcn UI (Radix UI primitives)
- **AI Engine:** Vercel AI SDK with OpenAI GPT-4o
- **Database:** PostgreSQL + Drizzle ORM
- **Testing:** Vitest (26 comprehensive tests)
- **Deployment:** Railway

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/mark2rocket/problem-hacker.git
cd problem-hacker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_postgresql_connection_string
```

4. Run database migrations:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

5. Start development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

Tests cover:
- System prompt enforcement (rejects WTP, demands sunk costs)
- Instinct mapping (all 5 core instincts)
- Extraction schema validation
- Enum validation for urgency, frequency, and instincts
- Mock AI response quality checks

All 26 tests pass ✅

## 📊 AI Prompt Engineering (Critical Component)

The AI system prompt is the heart of Problem Hacker. It enforces strict business validation rules:

### Hard Rejection Rules
```
- If user says "I would pay $X" → REJECT
- If user says "It's worth $X to me" → REJECT
- Demand actual sunk costs: "X hours/week * $Y/hr = $Z lost"
```

### Core Instinct Mapping
Every problem must map to one of 5 primal drives:
- **Survival:** Health, safety, security
- **Mate:** Attraction, relationships
- **Resource:** Money, possessions, efficiency
- **Status:** Recognition, respect, achievement
- **Kin Care:** Family, children, community

### Extraction Schema
```typescript
{
  problem_statement: string | null,
  target_customer: string | null,
  biz_metrics: {
    urgency_level: 'High (Stops Life)' | 'Low (Uncomfortable)' | null,
    current_alternative: string | null,
    core_instinct: 'Survival' | 'Mate' | 'Resource' | 'Status' | 'Kin Care' | null,
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | null,
    sunk_cost_calc: string | null
  },
  solution_direction: string | null
}
```

## 🎨 UI Components

### Terminal Theme
```css
--terminal-green: #00ff00
--terminal-bg: #0a0a0a
--terminal-border: #00ff0033
--font-mono: 'JetBrains Mono', monospace
```

### Key Components
- `ChatInterface` - Streaming AI conversation
- `ValueBoard` - Real-time business metrics display
- `InstinctBadge` - Color-coded instinct indicators
- `SunkCostDisplay` - Emphasized cost calculations
- `ExportButton` - Markdown export functionality

## 📁 Project Structure

```
problem-hacker/
├── src/
│   ├── app/
│   │   ├── api/chat/       # AI streaming endpoint
│   │   ├── globals.css     # Terminal theme
│   │   └── page.tsx        # Main dashboard
│   ├── components/
│   │   ├── chat/           # Chat interface components
│   │   ├── board/          # Value board components
│   │   └── ui/             # Shadcn UI primitives
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── prompts.ts  # System & extraction prompts
│   │   │   └── schema.ts   # Zod validation schemas
│   │   └── db/             # Database client & queries
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   └── __tests__/          # Vitest test suite
├── drizzle/                # Database migrations
└── railway.toml            # Deployment config
```

## 🚢 Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Add environment variables:
   - `OPENAI_API_KEY`
   - `DATABASE_URL` (auto-provisioned PostgreSQL)
3. Railway automatically detects Next.js and deploys

### Other Platforms

Problem Hacker works on any platform supporting Next.js 14:
- Vercel
- Netlify
- AWS Amplify
- Google Cloud Run

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Target Users

- **Primary:** Early-stage founders, side project developers
- **Secondary:** Product managers planning new features

## 🧠 Philosophy

> "90% of startup ideas fail because they solve fake problems. Problem Hacker helps you find the 10% that are real."

The tool is intentionally skeptical and demanding. It's designed to save you months (or years) of wasted effort by validating business value upfront.

## 📧 Contact

- GitHub: [@mark2rocket](https://github.com/mark2rocket)
- Repository: [problem-hacker](https://github.com/mark2rocket/problem-hacker)

---

Built with ❤️ and cynicism by the PRD Gem team

**Co-Authored-By: Claude Sonnet 4.5** <noreply@anthropic.com>
