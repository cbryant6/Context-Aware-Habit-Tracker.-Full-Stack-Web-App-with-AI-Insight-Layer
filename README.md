# Context-Aware Habit Tracker

A full-stack habit tracking app that goes beyond simple checkboxes. Instead of just recording *whether* you completed a habit, it captures the **context** — sleep quality, stress level, mood, and schedule disruptions — then uses AI to surface patterns between your daily conditions and habit success.

Built with Next.js 16, React 19, Supabase, and the Anthropic Claude API.

## Live Demo

**https://context-aware-habit-tracker-full-stack-web-app-with-3c3auz4q7.vercel.app**

Click **"Try Demo"** on the login page to explore with a pre-seeded account (45 days of data across 6 habits).

## Key Features

### Context-Aware Logging
Each habit log captures enrichment data alongside completion: sleep quality (1–5), stress level (1–5), mood, and whether your day was off-routine. This context data powers the AI analysis.

### AI Pattern Analysis
Uses Claude to analyze your logs and identify correlations — e.g., "You complete 91% of habits when sleep is 4+, but only 54% on high-stress days." Patterns are generated from real context data, not generic advice.

### Daily Health Check-In
Manual entry cards for steps, sleep hours, calories, and water intake. Designed for quick daily logging with a clean, Fini-inspired card UI.

### Home Dashboard
Time-aware greeting, daily inspirational quote (rotates from a curated set of 31), today-at-a-glance stats (completion rate, best active streak), and a daily challenge to encourage trying new wellness activities.

### Recovery Nudges
Implements the "never miss twice" principle from *Atomic Habits*. If a habit with a 2+ day streak was broken yesterday, a gentle nudge appears on the dashboard encouraging you to get back on track — not a guilt trip, just a quiet reminder.

### Motivation Reminders
When creating a habit, you can add a "why this matters" note (e.g., "I want more energy in the mornings"). This text appears in the daily log modal *before* the completion toggle, so you see your reason at the exact moment of decision.

### Paginated History
Browse all past log entries grouped by date, with habit filtering. Pagination ensures nothing is silently cut off.

### Completion Rate Chart
30-day bar chart with three visual states: completion percentage (violet), 0% days (violet, short bar), and no-data days (grey) — so missing data is never confused with failure.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| UI | React 19, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Charts | Recharts |
| Deployment | Vercel |

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout (dark theme base)
│   ├── login/page.tsx          # Auth page with "Try Demo" button
│   └── (app)/                  # Authenticated routes (light interior)
│       ├── home/page.tsx       # Home dashboard
│       ├── dashboard/page.tsx  # Daily habit checklist
│       ├── habits/page.tsx     # Habit CRUD management
│       ├── history/page.tsx    # Paginated log history
│       └── insights/page.tsx   # AI analysis + chart
├── components/
│   ├── today-checklist.tsx     # Habit list with streaks + recovery nudges
│   ├── context-log-form.tsx    # Modal: completion + context logging
│   ├── health-check-in.tsx     # Manual health data entry cards
│   ├── daily-quote.tsx         # Rotating inspirational quote
│   ├── daily-challenge.tsx     # Daily wellness challenge
│   ├── today-at-a-glance.tsx   # Summary stats cards
│   ├── completion-rate-chart.tsx # 30-day Recharts bar chart
│   ├── insights-panel.tsx      # AI analysis UI
│   ├── habit-form.tsx          # Create/edit habit form
│   ├── habits-manager.tsx      # Habit list with archive/edit
│   ├── history-list.tsx        # Paginated history with filters
│   └── navbar.tsx              # Dark navigation bar
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── home-data.ts            # Quotes, challenges, helpers
│   ├── supabase/               # Supabase client (browser + server)
│   └── actions/
│       └── insights.ts         # Server action: Claude API call
└── proxy.ts                    # Auth middleware
```

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### Setup

```bash
# Clone the repo
git clone https://github.com/cbryant6/Context-Aware-Habit-Tracker.-Full-Stack-Web-App-with-AI-Insight-Layer.git
cd Context-Aware-Habit-Tracker.-Full-Stack-Web-App-with-AI-Insight-Layer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase URL, anon key, and Anthropic API key

# Run database migrations
# Copy the SQL from supabase/migrations/*.sql and run in Supabase SQL Editor

# Seed the demo account (optional)
SUPABASE_SERVICE_ROLE_KEY=your-key npm run seed-demo

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Design Decisions

**Context over completion** — Most habit trackers only record binary completion. This app captures *why* you succeeded or failed, enabling data-driven self-awareness rather than just streak counting.

**AI with trimmed payloads** — Before sending data to Claude, logs are mapped to only the 7 relevant fields (habit, date, completed, sleep, stress, mood, schedule). This reduces token usage by ~50% without losing analytical value.

**Dark shell, light interior** — The login page and navbar use a dark theme with vibrant violet accents (inspired by [Fini](https://getfini.app)). The app interior stays light to keep the daily workflow feel clean and motivating.

**Behavioral science integration** — Two features are directly inspired by *Atomic Habits* by James Clear:
- **Make it Attractive**: Motivation reminders shown at the moment of decision
- **Never Miss Twice**: Recovery nudges after a broken streak, with encouraging (not punitive) language
