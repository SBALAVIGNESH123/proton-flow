# ProtonFlow ⚡

**All-in-one streaming analytics platform powered by Proton.**

Real-time log monitoring, system metrics dashboards, and intelligent alerting — all in a single deployment.

![Dashboard](screenshot-placeholder)

## Features

- **📋 Log Explorer** — Real-time log stream with search, filtering by level/service, auto-refresh
- **📈 Metrics Dashboard** — Live CPU, memory, disk, and custom metric charts with statistical summaries
- **🔔 Smart Alerts** — Threshold-based alert rules with webhook delivery (Slack, Discord, custom)
- **⚡ Powered by Proton** — Streaming SQL engine for sub-second query latency
- **🐳 One-Command Deploy** — `docker compose up` starts everything

## Quick Start

```bash
# Clone the repository
git clone https://github.com/SBALAVIGNESH123/protonflow.git
cd protonflow

# Start all services
docker compose up --build

# Open the dashboard
# → http://localhost:3000
```

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  ProtonFlow Web UI  │────▶│  ProtonFlow API   │────▶│  Proton Engine  │
│  (Next.js :3000)    │     │  (Express :4000)  │     │  (SQL :3218)    │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
                                     │
                              ┌──────┴──────┐
                              │ Alert Engine │
                              │  (Webhooks)  │
                              └─────────────┘
```

## API Reference

### Ingest Data

```bash
# Send logs
curl -X POST http://localhost:4000/api/ingest/logs \
  -H "Content-Type: application/json" \
  -d '{"level": "info", "service": "auth", "message": "User login successful"}'

# Send metrics
curl -X POST http://localhost:4000/api/ingest/metrics \
  -H "Content-Type: application/json" \
  -d '{"metric_name": "cpu_usage", "metric_value": 72.5, "host": "prod-1"}'
```

### Query Data

```bash
# Get recent logs
curl http://localhost:4000/api/query/logs?limit=50&level=error

# Get metric summary
curl http://localhost:4000/api/query/metrics/summary

# Get alert history
curl http://localhost:4000/api/query/alerts/history
```

### Alert Rules

```bash
# Create alert rule
curl -X POST http://localhost:4000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"name": "High CPU", "metric_name": "cpu_usage", "operator": "gt", "threshold": 90, "severity": "critical"}'

# List rules
curl http://localhost:4000/api/alerts
```

## Demo Data

Generate sample data to see the dashboard in action:

```bash
node demo/generate-data.js
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | Proton (Timeplus) — Streaming SQL |
| API | Node.js + Express |
| Frontend | Next.js 14 + React |
| Styling | Custom CSS (Dark Mode) |
| Deployment | Docker Compose |

## Created By

**Bala Vignesh S** — [GitHub](https://github.com/SBALAVIGNESH123)

Core contributor to [Timeplus Proton](https://github.com/timeplus-io/proton) (C++ streaming database engine).

## License

MIT
