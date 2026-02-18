# Instructions — Support Ticket System

Step-by-step guide to get the Support Ticket System running.

---

## Prerequisites

1. **Docker Desktop** (includes Docker Compose)
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Linux: https://docs.docker.com/desktop/install/linux-install/

2. **Google Gemini API Key** (for AI classification)
   - Go to https://aistudio.google.com/apikey
   - Click "Create API Key"
   - Copy the key — you'll need it below

3. **Git** (to track commit history)

---

## Step 1 — Clone / Navigate to the Project

```bash
cd /path/to/support-ticket-system
```

---

## Step 2 — Set the Gemini API Key

Set the key as an environment variable before starting docker:

**macOS / Linux:**
```bash
export GEMINI_API_KEY=your-gemini-api-key-here
```

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-gemini-api-key-here"
```

**Alternative:** Create a `.env` file in the project root:
```bash
echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env
```

> **Note:** The app works without an API key — the LLM features just won't be available. Tickets will default to `general` category and `medium` priority.

---

## Step 3 — Build and Start the Application

```bash
docker-compose up --build
```

This single command will:
1. Pull the PostgreSQL 15 image
2. Build the Django backend image (Python 3.11 + dependencies)
3. Build the React frontend image (Node 18 build → Nginx)
4. Start PostgreSQL and wait for it to be healthy
5. Run Django migrations automatically
6. Start the Django backend via Gunicorn (port 8000)
7. Start the React frontend via Nginx (port 3000)

Wait until you see output like:
```
backend_1   | Starting Gunicorn...
frontend_1  | ... start worker processes
```

---

## Step 4 — Access the Application

| Service   | URL                           |
|-----------|-------------------------------|
| Frontend  | http://localhost:3000          |
| Backend   | http://localhost:8000/api/     |
| Admin     | http://localhost:8000/admin/   |

---

## Step 5 — Using the Application

### Submit a Ticket
1. Click **"➕ Submit Ticket"** tab
2. Enter a **Title** (e.g., "Cannot access my account")
3. Enter a **Description** (e.g., "I've been trying to log in for the past hour but keep getting a 403 error")
4. Wait for the AI to suggest category and priority (you'll see a loading indicator)
5. Review and optionally override the AI suggestions
6. Click **"🚀 Submit Ticket"**

### Browse Tickets
1. Click **"📋 All Tickets"** tab
2. Use the **search bar** to search by title or description
3. Use the **dropdowns** to filter by category, priority, or status
4. Click **"Change Status"** on any ticket to update it

### View Dashboard
1. Click **"📊 Dashboard"** tab
2. View total tickets, open tickets, avg per day
3. See priority and category breakdowns as bar charts
4. Dashboard auto-refreshes when you submit a new ticket

---

## Step 6 — Stopping the Application

```bash
docker-compose down
```

To also remove the database volume (resets all data):
```bash
docker-compose down -v
```

---

## Step 7 — Useful Commands

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart a single service
```bash
docker-compose restart backend
```

### Access Django shell
```bash
docker-compose exec backend python manage.py shell
```

### Create a Django superuser (for admin panel)
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Run migrations manually
```bash
docker-compose exec backend python manage.py migrate
```

---

## API Testing with curl

### Create a ticket
```bash
curl -X POST http://localhost:8000/api/tickets/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Cannot login","description":"Getting 403 error when trying to login","category":"account","priority":"high"}'
```

### List all tickets
```bash
curl http://localhost:8000/api/tickets/
```

### Filter tickets
```bash
curl "http://localhost:8000/api/tickets/?category=technical&priority=high"
curl "http://localhost:8000/api/tickets/?search=login"
curl "http://localhost:8000/api/tickets/?status=open&category=billing"
```

### Update ticket status
```bash
curl -X PATCH http://localhost:8000/api/tickets/1/ \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

### Get statistics
```bash
curl http://localhost:8000/api/tickets/stats/
```

### Classify a description (LLM)
```bash
curl -X POST http://localhost:8000/api/tickets/classify/ \
  -H "Content-Type: application/json" \
  -d '{"description":"My credit card was charged twice for the same subscription"}'
```

---

## Troubleshooting

| Issue                              | Solution                                                  |
|------------------------------------|-----------------------------------------------------------|
| Port 3000/8000 already in use      | Stop the other service or change ports in `docker-compose.yml` |
| Frontend can't reach backend       | Make sure both services are running (`docker-compose ps`)  |
| LLM classification not working     | Check `GEMINI_API_KEY` is set correctly                   |
| Database connection errors         | Wait for PostgreSQL to be fully ready; check `db` logs    |
| Permission denied on entrypoint.sh | Run `chmod +x backend/entrypoint.sh`                      |
