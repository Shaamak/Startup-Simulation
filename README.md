# 🚀 AI Startup Simulator

> A production-grade, full-stack SaaS platform where users create virtual startups and an AI engine simulates customers, revenue, churn, competitors, funding, and investor reactions — all updated in real-time.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.11-green?logo=fastapi) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql) ![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Simulation Engine** | FastAPI + APScheduler runs S-curve growth, churn modeling, and funding round progression every 30 seconds |
| ⚡ **Real-Time Dashboard** | Socket.IO pushes live simulation ticks and event alerts to connected clients |
| 💰 **Revenue Modeling** | MRR, ARR, valuation (ARR × industry multiple), burn rate, and runway calculations |
| 🎯 **Funding Rounds** | Automated seed → Series A/B/C → IPO triggered by ARR thresholds with probability gates |
| 🏦 **Redis Caching** | Simulation state, user profiles, and startup data cached for sub-millisecond reads |
| 🔐 **JWT Auth** | Access + refresh token rotation, bcrypt password hashing, SHA-256 token storage |
| 📊 **Recharts Analytics** | Animated time-series charts for MRR, customer growth, and valuation |
| 🐳 **Docker Stack** | One-command startup with health checks, volume persistence, and service discovery |
| 📱 **Premium UI** | Dark glassmorphism design, Framer Motion animations, and fully responsive layout |
| 🛡️ **Rate Limiting** | Auth (10/15min), API (100/min), Uploads (20/min) via express-rate-limit |
| ✅ **Schema Validation** | Zod (frontend) + express-validator (backend) end-to-end |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  Next.js 14 (App Router) + Framer Motion + Recharts + Socket.IO  │
└──────────────┬───────────────────────────────────┬───────────────┘
               │  HTTP REST (Axios)                │  WebSocket (Socket.IO)
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS API  (Node.js + TS)                   │
│  JWT Auth │ Rate Limiting │ Helmet │ Compression │ Morgan        │
│  Auth Module │ Startup Module │ Simulation Module │ Uploads      │
└──────┬─────────────────────────────┬───────────────┬────────────┘
       │ PostgreSQL (node-postgres)   │ Redis (ioredis)│ HTTP Webhook
       ▼                             ▼                ▼
┌────────────┐              ┌──────────────┐   ┌────────────────┐
│ PostgreSQL │              │  Redis 7     │   │  FastAPI AI    │
│     16     │              │  Cache+Queue │   │  Service       │
│ 5 tables   │              │  Pub/Sub     │   │  APScheduler   │
└────────────┘              └──────────────┘   └────────────────┘
```

### Data Flow: Simulation Tick
```
APScheduler (30s) → SimulationEngine.tick() → POST /simulate/webhook
  → Backend saves to PostgreSQL → Caches in Redis
  → Socket.IO broadcasts to connected clients → React state update → UI re-render
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS | App Router, SSR, type safety |
| **UI Components** | shadcn/ui, Framer Motion, Recharts | Animations, charts, accessible components |
| **Backend** | Node.js, Express.js, TypeScript | REST API, middleware, routing |
| **Real-time** | Socket.IO | Bi-directional event streaming |
| **Database** | PostgreSQL 16 | Persistent data, relational integrity |
| **Cache / Queue** | Redis 7 | Sub-ms reads, session store |
| **AI Service** | Python 3.11, FastAPI | Async simulation engine |
| **Scheduling** | APScheduler | Background simulation ticks |
| **Auth** | JWT (15-min access + 7-day refresh rotation), bcryptjs | Secure stateless auth |
| **Validation** | Zod, express-validator | Schema validation end-to-end |
| **DevOps** | Docker, Docker Compose | Containerized, reproducible stack |

---

## 📁 Project Structure

```
startup_simulation/
├── frontend/                    # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── (auth)/          # Login, Register pages
│       │   ├── (app)/           # Protected app shell
│       │   │   ├── dashboard/   # Main dashboard with live metrics
│       │   │   ├── startup/
│       │   │   │   ├── create/  # 4-step startup wizard
│       │   │   │   └── [id]/    # Individual startup detail page
│       │   │   └── settings/    # Profile, security, notifications, billing
│       │   └── page.tsx         # Landing page
│       ├── components/dashboard/
│       │   ├── MetricCard.tsx   # Animated KPI cards
│       │   ├── RevenueChart.tsx # Recharts MRR/customers chart
│       │   ├── ActivityFeed.tsx # Real-time event timeline
│       │   └── SimulationStatus.tsx  # Control panel + progress bars
│       ├── contexts/
│       │   ├── AuthContext.tsx  # JWT auth state + token refresh
│       │   └── SocketContext.tsx# Socket.IO connection management
│       ├── lib/
│       │   ├── api.ts           # Axios client + auto-refresh interceptor
│       │   └── utils.ts         # formatCurrency, formatNumber helpers
│       └── types/               # Shared TypeScript interfaces
│
├── backend/                     # Express + TypeScript API
│   └── src/
│       ├── modules/
│       │   ├── auth/            # Register, login, refresh, logout, me, change-password
│       │   ├── startup/         # CRUD + logo/banner upload
│       │   ├── simulation/      # State, start, pause, metrics, events, AI webhook
│       │   └── uploads/         # Multer file handling
│       ├── repositories/        # Raw SQL via node-postgres
│       │   ├── user.repository.ts
│       │   ├── startup.repository.ts
│       │   └── simulation.repository.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts       # JWT verification
│       │   ├── rateLimit.middleware.ts  # Per-route rate limiting
│       │   ├── validate.middleware.ts   # Zod schema validation
│       │   └── errorHandler.middleware.ts
│       └── config/
│           ├── database.ts      # node-postgres pool
│           ├── redis.ts         # ioredis client + cache helpers
│           ├── env.ts           # Type-safe env parsing
│           └── socket.ts        # Socket.IO init + emit helpers
│
├── ai-service/                  # FastAPI simulation engine
│   ├── main.py                  # App entry, CORS, lifespan
│   ├── routers/simulation.py    # /simulate/start, /stop, /active
│   ├── services/
│   │   └── simulation_engine.py # S-curve growth, churn, funding, events
│   ├── scheduler/tasks.py       # APScheduler job management
│   └── models/simulation.py     # Pydantic request/response models
│
├── database/migrations/         # SQL migration files (auto-applied by Docker)
│   ├── 001_create_users.sql
│   ├── 002_create_startups.sql
│   ├── 003_create_simulations.sql
│   ├── 004_create_events.sql
│   └── 005_create_metrics.sql
│
└── docker-compose.yml           # Full 5-service stack with health checks
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Node.js 20+ (for local dev)
- Python 3.11+ (for AI service local dev)

### Option 1: Docker (Recommended — one command)

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd startup_simulation

# 2. Set up environment
cp .env.example .env
# Edit .env if needed — defaults work out of the box

# 3. Start the full stack
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| FastAPI AI Service | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:4000/health |

### Option 2: Local Development (without Docker)

**Start infrastructure:**
```bash
docker-compose up postgres redis -d
```

**Backend:**
```bash
cd backend
npm install
npm run dev     # ts-node-dev with hot reload on :4000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev     # Next.js dev server on :3000
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🗄️ Database Schema

```sql
users              -- id, email, password_hash (bcrypt), full_name, plan, avatar_url
startups           -- id, user_id, name, industry, pricing_model, monthly_budget, target_audience
simulations        -- startup_id (1:1), is_running, day, customers, mrr, arr, valuation, ...
simulation_events  -- id, startup_id, event_type, title, impact (positive/negative/neutral)
simulation_metrics -- time-series snapshots: startup_id, day, customers, mrr, valuation
refresh_tokens     -- user_id, token_hash (SHA-256), expires_at (7-day TTL)
```

---

## 🧮 Simulation Engine (AI Service)

The simulation engine runs mathematical models every 30 seconds:

**Customer Acquisition (S-Curve):**
```python
growth_rate = base_rate × market_saturation × budget_boost × noise × popularity_boost
new_customers = customers × growth_rate + random(1, 10)
```

**Revenue:**
```python
paying_customers = customers × conversion_rate[pricing_model]
mrr = paying_customers × arpu[pricing_model]
arr = mrr × 12
```

**Valuation:**
```python
valuation = arr × industry_multiple × (1 + investor_interest / 200)
```

**Funding Rounds:** ARR thresholds → Seed ($100K) → Series A ($1M) → Series B ($5M) → Series C ($20M) → IPO ($100M)

**Industry Profiles (11 industries):**

| Industry | Growth Base | Churn Base | Revenue Multiple |
|----------|------------|------------|------------------|
| SaaS | 18% | 5% | 8× |
| AI/ML | 22% | 6% | 10× |
| Fintech | 14% | 4% | 6× |
| Gaming | 25% | 15% | 3× |
| CleanTech | 8% | 2% | 5× |

---

## 🔌 API Reference

### Authentication
```
POST /api/auth/register     — Create account
POST /api/auth/login        — Login, returns JWT pair
POST /api/auth/refresh      — Rotate refresh token
POST /api/auth/logout       — Revoke refresh token
GET  /api/auth/me           — Get current user (protected)
PATCH /api/auth/me          — Update profile name (protected)
POST /api/auth/change-password — Change password (protected)
```

### Startups
```
GET    /api/startups           — List user's startups
POST   /api/startups           — Create startup
GET    /api/startups/:id       — Get startup by ID
PATCH  /api/startups/:id       — Update startup
DELETE /api/startups/:id       — Delete startup
POST   /api/startups/:id/logo  — Upload logo (multipart)
POST   /api/startups/:id/banner — Upload banner (multipart)
```

### Simulations
```
GET  /api/simulations/:startupId           — Get simulation state
POST /api/simulations/:startupId/start     — Start simulation
POST /api/simulations/:startupId/pause     — Pause simulation
GET  /api/simulations/:startupId/metrics   — Time-series metrics (last 90 ticks)
GET  /api/simulations/:startupId/events    — Event log (last 20 events)
POST /api/simulations/:startupId/tick      — AI service webhook (internal)
```

### AI Service
```
POST /simulate/start   — Register & start simulation job
POST /simulate/stop    — Stop simulation job
GET  /simulate/active  — List active simulations
GET  /health           — Service health
GET  /docs             — Swagger UI
```

---

## 🔐 Security

- **Passwords**: bcrypt with 12 salt rounds
- **Access tokens**: HS256 JWT, 15-minute expiry
- **Refresh tokens**: cryptographically random 64-byte hex, stored as SHA-256 hash
- **Token rotation**: Old refresh token revoked on every refresh
- **Rate limiting**: Auth routes (10/15min), API (100/min), Uploads (20/min)
- **Helmet.js**: Security headers (HSTS, CSP, X-Frame-Options)
- **CORS**: Strict origin whitelist configurable via env
- **SQL injection**: Parameterized queries only (no string interpolation)

---

## 📦 Environment Variables

Copy `.env.example` to `.env`. Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | HS256 signing secret | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection string | Set automatically in Docker |
| `REDIS_URL` | Redis connection string | Set automatically in Docker |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

---

## 🎨 UI Design System

- **Colors**: HSL-tuned dark palette (surface, brand, accents)
- **Typography**: Inter from Google Fonts
- **Components**: Glassmorphism cards, gradient buttons, animated badges
- **Motion**: Framer Motion page transitions, metric card animations, chart reveals
- **Charts**: Recharts with custom dark tooltips and animated line paths

---

## 🔮 Roadmap

- [x] Phase 1: JWT Auth (access + refresh tokens, bcrypt)
- [x] Phase 2: Startup Creation (4-step wizard, file uploads)
- [x] Phase 3: Dashboard (live metrics, Recharts, startup selector)
- [x] Phase 4: AI Simulation Engine (FastAPI, APScheduler, S-curve model)
- [x] Phase 5: Real-time (Socket.IO ticks, event feed)
- [x] Phase 6: Premium UI (glassmorphism, Framer Motion, responsive)
- [x] Phase 7: Startup Detail Page, Settings (profile, security, billing)
- [ ] Phase 8: Competitor mode (multi-user bracket simulation)
- [ ] Phase 9: AI investor chat (LLM pitch evaluation)
- [ ] Phase 10: Export reports (PDF, CSV)

---

## 👨‍💻 About

Built as a portfolio project to demonstrate:
- **Full-stack TypeScript** — end-to-end type safety across frontend and backend
- **Microservices architecture** — decoupled AI service communicating via HTTP webhooks
- **Real-time systems** — Socket.IO room management and event broadcasting
- **Production patterns** — Redis caching, token rotation, rate limiting, health checks
- **Mathematical modeling** — S-curve growth, stochastic noise, ARR-based valuation

---

*Built with Next.js · Express · FastAPI · PostgreSQL · Redis · Docker · Socket.IO*
