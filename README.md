# Support Ticket System

A full-stack support ticket management system with AI-powered ticket classification, built with Django, React, and Google Gemini.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

## Features

- **Submit Tickets** — Fill in a title and description; the AI auto-suggests category and priority
- **LLM Classification** — Google Gemini analyzes ticket descriptions and suggests the best category (`billing`, `technical`, `account`, `general`) and priority (`low`, `medium`, `high`, `critical`)
- **Browse & Filter** — View all tickets with filters by category, priority, status, and a full-text search bar
- **Status Management** — Click any ticket to change its status (open → in_progress → resolved → closed)
- **Analytics Dashboard** — Real-time stats: total/open tickets, avg tickets per day, and priority/category breakdowns (computed via DB-level aggregation)
- **Fully Containerized** — One command (`docker-compose up --build`) boots everything

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | Django 4.2 + Django REST Framework  |
| Database    | PostgreSQL 15                       |
| Frontend    | React 18 + Axios                    |
| LLM         | Google Gemini 2.0 Flash             |
| Infra       | Docker + Docker Compose + Nginx     |

## LLM Choice: Google Gemini

I chose **Google Gemini (`gemini-2.0-flash`)** for the following reasons:

1. **Speed** — `gemini-2.0-flash` is optimized for low-latency responses, which is perfect for real-time classification as the user types
2. **Cost** — Gemini offers a generous free tier, making it accessible without incurring significant costs
3. **Quality** — Even the "flash" variant produces accurate structured JSON output for classification tasks
4. **Simple SDK** — The `google-generativeai` Python package is straightforward to integrate with minimal boilerplate

The prompt is designed to:
- Provide clear definitions for each category and priority level
- Request strictly valid JSON output
- Validate responses and fall back to safe defaults if the LLM returns unexpected data

## Design Decisions

1. **DB-Level Aggregation** — The `/api/tickets/stats/` endpoint uses Django ORM `annotate()` and `Count()` for all statistics, never Python-level loops
2. **Graceful LLM Degradation** — If the API key is missing or the LLM fails, the app still works perfectly — it just won't auto-suggest category/priority
3. **Debounced Classification** — The frontend calls the classify API 800ms after the user stops typing in the description field, avoiding excessive API calls
4. **User Override** — AI suggestions pre-fill dropdowns but the user has full control to change them before submitting
5. **Dark Theme** — The UI uses a premium dark theme with gradient accents, priority color coding, and smooth animations
6. **Nginx Proxy** — The frontend nginx serves the React SPA and proxies `/api/*` requests to the Django backend, keeping the architecture clean

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- A Google Gemini API key (get one at https://aistudio.google.com/apikey)

### Run

```bash
# Clone the repository
cd support-ticket-system

# Set your Gemini API key
export GEMINI_API_KEY=your-api-key-here

# Build and start everything
docker-compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/

### Without an API Key

The app works without an API key — the LLM classification feature will simply be disabled and tickets will default to `general` category and `medium` priority.

## Project Structure

```
├── docker-compose.yml          # Orchestrates all services
├── README.md                   # This file
├── instructions.md             # Detailed step-by-step guide
├── backend/
│   ├── Dockerfile              # Python 3.11 + Gunicorn
│   ├── entrypoint.sh           # Wait for DB + migrate + start
│   ├── requirements.txt
│   ├── manage.py
│   ├── backend/                # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── tickets/                # Main Django app
│       ├── models.py           # Ticket model
│       ├── serializers.py
│       ├── views.py            # API views + LLM integration
│       ├── urls.py
│       └── admin.py
└── frontend/
    ├── Dockerfile              # Node build → Nginx
    ├── nginx.conf              # SPA + API proxy
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.jsx             # Main app with tabs
        ├── App.css             # Full theme
        ├── api.js              # Axios API layer
        └── components/
            ├── TicketForm.jsx      # Submit form + LLM
            ├── TicketList.jsx      # List + filters
            ├── TicketCard.jsx      # Individual ticket
            ├── FilterBar.jsx       # Search + dropdowns
            └── StatsDashboard.jsx  # Analytics
```

## API Endpoints

| Method | Endpoint                | Description                      |
|--------|-------------------------|----------------------------------|
| POST   | `/api/tickets/`         | Create a new ticket (201)        |
| GET    | `/api/tickets/`         | List tickets (filters + search)  |
| PATCH  | `/api/tickets/<id>/`    | Update a ticket                  |
| GET    | `/api/tickets/stats/`   | Aggregated statistics            |
| POST   | `/api/tickets/classify/`| LLM-based classification         |

## License

This project was built as a technical assessment.
