# OmniShop OS

> AI-Powered Commerce Operating System

An intent-driven shopping experience that turns natural conversation, visual inspiration, and user context into instant, executed e-commerce transactions.

## Architecture

```
omnishop-os/
├── apps/
│   └── backend-core/    # FastAPI + LangGraph Agent Core
│       ├── app/
│       │   ├── agents/       # LangGraph orchestrator & nodes
│       │   ├── api/          # REST endpoints & middleware
│       │   ├── core/         # Config, database, security
│       │   ├── mcp_servers/  # MCP tool functions
│       │   ├── models/       # SQLAlchemy ORM & Pydantic schemas
│       │   └── services/     # Mock AI services
│       └── scripts/          # Database seeding
└── README.md
```

## Quick Start

```bash
cd apps/backend-core

# Install dependencies
pip install -e .

# Start the server (auto-seeds demo data on first run)
uvicorn app.main:app --reload --port 8000

# Open API docs
open http://localhost:8000/docs
```

## Demo Credentials

| Role     | Email              | Password |
|----------|--------------------|----------|
| Customer | customer@demo.com  | demo123  |
| Merchant | merchant@demo.com  | demo123  |
| Admin    | admin@demo.com     | demo123  |

## Key Endpoints

| Endpoint                          | Description                    |
|-----------------------------------|--------------------------------|
| `POST /api/v1/chat`              | AI conversational shopping     |
| `POST /api/v1/search/visual`     | Image-based product search     |
| `GET  /api/v1/products`          | Product catalog                |
| `POST /api/v1/cart/action`       | Cart management                |
| `GET  /api/v1/admin/dashboard`   | Merchant analytics             |
| `GET  /api/v1/admin/returns/risk-audit` | Fraud detection          |
| `GET  /api/v1/admin/reviews/audit`| Fake review detection         |
