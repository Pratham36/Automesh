# Automesh

A full-stack workflow automation platform — build, visualize, and run multi-step automations with a drag-and-drop editor. Think Zapier or Make.com, but self-hosted and fully open source.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Inngest](https://img.shields.io/badge/Inngest-3-7C3AED)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What it does

Automesh lets users create workflows made up of connected nodes. Each node is a task — call an API, run an AI prompt, send a Discord/Slack/Telegram message. Nodes are connected in the editor and executed in order (or in parallel) when a trigger fires.

**Triggers** — what starts a workflow:
- Manual trigger (button in the UI)
- Stripe payment events (webhook)
- Google Form submissions (Apps Script webhook)

**Action nodes** — what the workflow does:
- HTTP Request (call any external API)
- AI text generation — Anthropic Claude, OpenAI GPT, Google Gemini, Groq
- Send message — Discord, Slack, Telegram

**Execution engine:**
- Powered by [Inngest](https://inngest.com) — durable, retryable background jobs
- Real-time node status updates in the editor (running / completed / failed)
- Full execution history with output stored per run

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| API | tRPC 11 + TanStack Query |
| Auth | Better Auth |
| Database | PostgreSQL + Prisma 6 |
| Background jobs | Inngest |
| Payments | Polar (subscriptions) |
| Workflow editor | React Flow (`@xyflow/react`) |
| UI | Tailwind CSS v4 + Radix UI + shadcn/ui |
| State | Jotai |
| Error tracking | Sentry |
| Linter/Formatter | Biome |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Login, signup pages
│   ├── (dashboard)/
│   │   ├── (editor)/            # Workflow drag-and-drop editor
│   │   └── (rest)/              # Workflows, executions, credentials pages
│   └── api/
│       ├── auth/                # Better Auth handler
│       ├── inngest/             # Inngest event receiver
│       ├── trpc/                # tRPC HTTP handler
│       └── webhooks/
│           ├── stripe/          # Stripe event webhook
│           └── google-form/     # Google Form submission webhook
│
├── components/                  # Shared UI + React Flow node components
│
├── features/
│   ├── auth/                    # Login/register forms
│   ├── credentials/             # API key management (encrypted at rest)
│   ├── editor/                  # Workflow canvas, node toolbar
│   ├── executions/              # Execution history, per-node executors
│   │   └── components/
│   │       ├── anthropic/       # Claude executor
│   │       ├── gemini/          # Gemini executor
│   │       ├── openai/          # OpenAI executor
│   │       ├── groq/            # Groq executor
│   │       ├── http-request/    # HTTP call executor
│   │       ├── discord/         # Discord message executor
│   │       ├── slack/           # Slack message executor
│   │       └── telegram/        # Telegram message executor
│   ├── triggers/
│   │   └── components/
│   │       ├── manual-trigger/
│   │       ├── stripe-trigger/
│   │       └── google-form-trigger/
│   └── workflows/               # Workflow CRUD, list view
│
├── inngest/
│   ├── client.ts                # Inngest client setup
│   ├── function.ts              # Main workflow execution function
│   ├── utils.ts                 # sendWorkflowExecution helper
│   └── channels/                # Per-node Inngest realtime channels
│
├── lib/
│   ├── auth.ts                  # Better Auth config
│   ├── db.ts                    # Prisma client singleton
│   ├── encryption.ts            # AES-256-GCM credential encryption
│   └── polar.ts                 # Polar subscription client
│
└── trpc/
    ├── init.ts                  # tRPC context + procedure builders
    ├── routers/_app.ts          # Root router
    ├── server.tsx               # Server-side caller
    └── client.tsx               # Client-side provider
```

---

## Database Schema

```
User ──< Workflow ──< Node
  │                    │
  └──< Credential ─────┘ (optional, for AI nodes)

Workflow ──< Connection  (Node → Node edges)
Workflow ──< Execution   (run history)
```

**Node types:** `MANUAL_TRIGGER`, `HTTP_REQUEST`, `GOOGLE_FORM_TRIGGER`, `STRIPE_TRIGGER`, `ANTHROPIC`, `GEMINI`, `OPENAI`, `GROQ`, `DISCORD`, `SLACK`, `TELEGRAM`

**Execution statuses:** `RUNNING`, `COMPLETED`, `FAILED`

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted — [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)
- [Inngest account](https://inngest.com) (free tier works)
- [Polar account](https://polar.sh) for subscriptions

### 1. Clone and install

```bash
git clone https://github.com/Pratham36/Automesh.git
cd Automesh
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/automesh"

# Auth (Better Auth)
BETTER_AUTH_SECRET="your-secret-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Credential encryption key (generate: openssl rand -hex 32)
ENCRYPTION_KEY="your-64-char-hex-string"

# Inngest
INNGEST_EVENT_KEY="your-inngest-event-key"
INNGEST_SIGNING_KEY="your-inngest-signing-key"

# Polar (subscriptions)
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_WEBHOOK_SECRET="your-polar-webhook-secret"

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"

# Webhooks — generate with: openssl rand -hex 32
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
GOOGLE_FORM_WEBHOOK_SECRET="your-64-char-hex-string"
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server

You need 3 terminals running simultaneously:

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Inngest dev server (receives and runs background jobs)
npm run inngest

# Terminal 3 — ngrok (for webhooks — Stripe/Google Forms need a public URL)
npm run ngrok
```

App runs at `http://localhost:3000`
Inngest UI at `http://localhost:8288`

---

## Webhook Setup

### Stripe

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe?workflowId=<id>`
3. Select events (e.g. `payment_intent.succeeded`)
4. Copy the signing secret (`whsec_...`) → add to `.env` as `STRIPE_WEBHOOK_SECRET`

**Testing locally:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe?workflowId=your_id
stripe trigger payment_intent.succeeded
```

### Google Form

1. Open your Google Form → Extensions → Apps Script
2. In the Automesh editor, open a Google Form Trigger node → copy the generated Apps Script
3. Paste it into Apps Script editor
4. Replace `REPLACE_WITH_YOUR_SECRET` with your `GOOGLE_FORM_WEBHOOK_SECRET` value
5. Save → Triggers (clock icon) → Add Trigger → `onFormSubmit` → From form → On form submit

---

## Adding Credentials (for AI nodes)

1. Go to **Credentials** in the sidebar
2. Click **New Credential**
3. Select type: `ANTHROPIC`, `OPENAI`, `GEMINI`, or `GROQ`
4. Paste your API key — it is encrypted with AES-256-GCM before being stored

When building a workflow, select the credential on any AI node.

---

## Building a Workflow

1. Click **New Workflow** from the dashboard
2. The editor opens with a single start node
3. Click **+** to add nodes from the panel
4. Connect nodes by dragging from one handle to another
5. Click a node to configure it (set URL, prompt, channel ID, etc.)
6. Click **Run** to execute — watch node statuses update in real time
7. View full execution history under **Executions**

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel project dashboard.

For the database, use a serverless-compatible provider like [Neon](https://neon.tech) with connection pooling enabled.

> **Important:** In production, add `?pgbouncer=true&connection_limit=1` to your `DATABASE_URL` or use [Prisma Accelerate](https://www.prisma.io/accelerate) to handle connection pooling — serverless functions create a new DB connection per invocation.

After deploying:
- Update `NEXT_PUBLIC_API_URL` and `BETTER_AUTH_URL` to your production domain
- Update your Stripe webhook endpoint URL in the Stripe dashboard
- Update your Google Form Apps Script webhook URL

---

## Available Scripts

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run start      # Start production server
npm run inngest    # Start Inngest local dev server
npm run ngrok      # Expose localhost:3000 via ngrok
npm run lint       # Run Biome linter
npm run format     # Auto-format with Biome
```

---

## Security Notes

- All API credentials stored by users are encrypted at rest using AES-256-GCM
- Stripe webhooks are verified using HMAC-SHA256 signature validation
- Google Form webhooks use a shared secret + HMAC-SHA256 to authenticate requests
- tRPC procedures are protected — all routes require an authenticated session
- HTTP Request nodes validate URLs to block internal network access (SSRF protection)

---

## Roadmap

- [ ] Parallel node execution for independent branches
- [ ] Per-user workflow execution concurrency limits
- [ ] Node-level execution timeouts
- [ ] More trigger types (Webhooks, Cron/Schedule)
- [ ] More action nodes (Email, GitHub, Notion, Airtable)
- [ ] Workflow versioning and rollback
- [ ] Team/organization support
- [ ] Environment variable injection per workflow

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Open a PR
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built by [Pratham Ashra](https://github.com/Pratham36)
