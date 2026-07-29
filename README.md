# 💎 Prism OS — AI-Powered Commerce Operating System

> **An intent-driven, multi-modal commerce platform that transforms natural conversation, visual inspiration, and user context into instant, executed e-commerce transactions.**

---

## 🌟 Overview

**Prism OS** reimagines traditional e-commerce by replacing manual keyword searches, static filters, and multi-step checkout funnels with an **autonomous agentic workflow** powered by **LangGraph**, **FastAPI**, **Next.js 15 App Router**, and **Generative UI**.

Instead of browsing dozens of tabs, users interact with a multi-modal AI agent that understands intent, analyzes uploaded imagery, generates dynamic comparison matrices, and stages instant in-line checkouts—all backed by a **Merchant Command Center** with real-time fraud risk auditing and review authenticity verification.

---

## 🏗️ End-to-End Architecture

Prism OS is architected as a modern monorepo separating high-performance backend AI orchestration from a dynamic, responsive Next.js frontend:

```
prism-os/
├── apps/
│   ├── backend-core/               # FastAPI + LangGraph Agent Core (Python 3.11+)
│   │   ├── app/
│   │   │   ├── agents/             # LangGraph orchestrator & state machine nodes
│   │   │   │   ├── nodes/          # Planner, Vision, Retriever, Executor, Reflection
│   │   │   │   ├── prompts/        # System prompts & router logic
│   │   │   │   └── graph.py        # Agent state graph compilation
│   │   │   ├── api/                # REST endpoints & SSE streaming handlers
│   │   │   │   └── v1/endpoints/   # Chat, Products, Search, Cart, Auth, Admin
│   │   │   ├── core/               # Configuration, async database setup, security
│   │   │   ├── mcp_servers/        # Model Context Protocol (MCP) tool servers
│   │   │   ├── models/             # SQLAlchemy ORM models & Pydantic v2 schemas
│   │   │   └── services/           # Vector search, vision, LLM simulation, fraud engine
│   │   ├── scripts/                # Database seeding & migration scripts
│   │   └── pyproject.toml          # Python dependencies & build config
│   │
│   └── web/                        # Next.js 15 Frontend (App Router + TailwindCSS)
│       ├── src/
│       │   ├── app/(os)/           # Main OS views: workspace, discover, merchant, etc.
│       │   ├── components/         # Generative UI, chat visualizers, workspace layout
│       │   ├── hooks/              # Custom React hooks
│       │   ├── lib/                # API client, SSE stream reader, utilities
│       │   ├── stores/             # Zustand state management (cart, chat, UI)
│       │   └── theme/              # Centralized tokenized design system
│       ├── package.json            # Frontend dependencies
│       └── next.config.ts          # Next.js configuration
└── README.md
```

---

## 🤖 LangGraph Agent State Machine

At the heart of Prism OS is a **LangGraph-powered state machine** that coordinates multi-node agent reasoning, visual analysis, catalog retrieval, and action execution with self-reflection.

```
                  ┌──────────────────────┐
                  │      User Request    │
                  └──────────┬───────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │   Planner Node    │
                   │ (Intent Classifier│
                   │ & Query Expander) │
                   └─────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │ (VISUAL)       │ (SEARCH)       │ (CART/ACTION)
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │ Vision Node │  │  Retriever  │  │  Executor   │
     │  (Image &   │  │   (Vector   │  │ (MCP Tools  │
     │ Embeddings) │  │  Search)    │  │ Execution)  │
     └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │  Reflection Node  │
                   │ (Quality Check &  │
                   │ Constraint Audit) │
                   └─────────┬─────────┘
                             │
                    ┌────────┴────────┐
             Passes │                 │ Needs Retry
                    ▼                 ▼
          ┌───────────────────┐  ┌─────────────┐
          │ Streamed Response │  │ Re-Planner  │
          │ & Generative UI   │  └─────────────┘
          └───────────────────┘
```

### State Machine Nodes:
1. **Planner Node**: Classifies user query into standard intents (`VISUAL_SEARCH`, `SEARCH`, `RECOMMEND`, `COMPARE`, `CART`, `GENERAL`) and expands queries with e-commerce synonyms.
2. **Vision Node**: Extracts visual characteristics (color palette, category, style, pattern) from uploaded imagery and matches against visual embeddings.
3. **Retriever Node**: Executes hybrid semantic vector search and multi-attribute catalog filtering using Model Context Protocol (MCP) tools.
4. **Executor Node**: Performs state-modifying actions (adding items to cart, calculating comparisons, building staged checkouts).
5. **Reflection Node**: Evaluates result quality against user constraints (budget limits, stock availability, rating minimums) and triggers automated retries if confidence is below threshold.

---

## 🎨 Generative UI Architecture

Prism OS streams interactive React components alongside assistant text over Server-Sent Events (SSE). The user workspace split-pane dynamically renders component payloads inside the **Generative Context Panel**:

* **`ReasoningBadge`**: Real-time expandable "Thinking..." stepper visualizer showing active agent nodes (`Planner` ➔ `Retriever` / `Vision` / `Executor` ➔ `Reflect`).
* **`ProductCarousel`**: Horizontal interactive product card deck with match percentage badges, price tags, and quick-add actions.
* **`ComparisonMatrix`**: Dynamic side-by-side spec & feature evaluation table generated on the fly.
* **`StagedCheckout`**: In-line interactive checkout widget embedded directly inside the conversation stream with itemized totals, address selection, and 1-click confirmation.

---

## 🛠️ Model Context Protocol (MCP) Tool Servers

Backend tools are decoupled into modular MCP server toolsets (`app/mcp_servers/`):

| Server | Tool | Description |
|---|---|---|
| **Catalog** | `search_catalog` | Multi-attribute catalog filtering (category, price range, min rating). |
| **Catalog** | `vector_search` | Semantic vector search using text query embeddings. |
| **Cart** | `add_to_cart` | Add product variants to customer active cart. |
| **Cart** | `stage_checkout` | Build complete staged checkout payload with taxes, shipping, and discount. |
| **Recommendation**| `get_recommendations` | Hybrid collaborative & content-based product recommendations. |
| **Recommendation**| `visual_match` | Rank catalog items by visual feature similarity vectors. |
| **Risk Control** | `evaluate_risk` | Calculate transaction fraud risk score based on velocity & location. |
| **Risk Control** | `audit_review` | ML sentiment and authenticity verification for product reviews. |

---

## 💻 Full Feature Matrix

### 🛒 Customer Experience (`/workspace`, `/discover`, `/cart`, `/compare`)
* **Conversational AI Workspace**: Chat interface with voice-input support and live streaming thought process.
* **Multi-Modal Visual Search**: Upload images to find visually similar items across catalog inventory.
* **Side-by-Side Generative Comparison**: Instant side-by-side spec comparison table for 2-4 products.
* **Smart Intent Cart**: Staged checkout with coupon auto-application and real-time shipping calculation.
* **Personalized Discover Feed**: AI-curated product mood boards tailored to user browsing history.

### 🛡️ Merchant Command Center (`/merchant`)
* **Real-Time Session Analytics**: Track customer intent trends, conversation volume, conversion rate, and revenue pipeline.
* **AI Fraud & Risk Table**: Real-time risk audit table flagging high-velocity, suspicious IP, or fraudulent transaction attempts with manual overrides (`Approve` / `Decline`).
* **Authenticity Review Feed**: AI-driven review audit flagging bot-generated, spam, or incentive-biased customer reviews.

---

## ⚡ Quick Start & Installation

### Prerequisites
* **Python**: `3.11+`
* **Node.js**: `18.x` or `20.x`
* **npm** / **pnpm** / **yarn**

### 1. Backend Core Setup
```bash
cd apps/backend-core

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .

# Start FastAPI backend (auto-seeds SQLite database on initial launch)
uvicorn app.main:app --reload --port 8000
```
> The API server will start at `http://localhost:8000` (Interactive API Docs: `http://localhost:8000/docs`).

### 2. Frontend Setup
Open a new terminal window:
```bash
cd apps/web

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
> The web app will start at `http://localhost:3000`.

---

## 🔐 Demo Credentials

Use these seeded accounts to test different roles across Customer & Merchant views:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Customer** | `customer@demo.com` | `demo123` | Conversational Shopping, Visual Search, Cart, Orders |
| **Merchant** | `merchant@demo.com` | `demo123` | Merchant Command Center (`/merchant`), Risk Table, Analytics |
| **Admin** | `admin@demo.com` | `demo123` | Full System Access & Audit Logs |

---

## 📡 API Endpoint Summary

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Chat** | `POST` | `/api/v1/chat/stream` | SSE streaming AI agent interaction with Generative UI |
| **Chat** | `GET` | `/api/v1/chat/history` | Retrieve past conversation history & state |
| **Catalog** | `GET` | `/api/v1/products` | Fetch catalog with pagination & filters |
| **Catalog** | `GET` | `/api/v1/products/{id}` | Get detailed product specifications & reviews |
| **Search** | `POST` | `/api/v1/search/visual` | Multi-modal image visual search endpoint |
| **Search** | `POST` | `/api/v1/search/semantic` | Vector similarity semantic search |
| **Cart** | `POST` | `/api/v1/cart/action` | Perform cart operations (add, update, checkout) |
| **Merchant**| `GET` | `/api/v1/admin/dashboard` | Real-time session analytics summary |
| **Merchant**| `GET` | `/api/v1/admin/returns/risk-audit` | Fraud risk audit log table |
| **Merchant**| `GET` | `/api/v1/admin/reviews/audit` | Fake review detection feed |

---

## 🗄️ Database Schema & Models

Built with **SQLAlchemy 2.0 (Async)**:

* **`User`**: ID, email, password hash, role (`CUSTOMER`, `MERCHANT`, `ADMIN`), full name, risk tier.
* **`Product`**: ID, title, description, price, category, stock, vector embedding metadata, specifications.
* **`Category`**: ID, name, slug, parent category.
* **`Order` & `OrderItem`**: Order details, user reference, total price, status, shipping address, risk score.
* **`Review`**: Rating, commentary, user reference, product reference, AI authenticity score (`0.0 - 1.0`), flagged boolean.
* **`ChatSession` & `ChatMessage`**: Session tracking, message content, thought steps JSON, component payload JSON.
* **`RiskLog`**: High-risk flag history, risk reason, severity score, status (`PENDING`, `APPROVED`, `REJECTED`).

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
