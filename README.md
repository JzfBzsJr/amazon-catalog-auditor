# Amazon Catalog Auditor

A full-stack web application for auditing Amazon Category Listing Reports (CLR). Upload a CLR `.xlsx` file and get a structured audit report across 9 catalog health checks in seconds.

---

## Project Structure

```
/
├── backend/                    # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   ├── Procfile
│   └── railway.json
├── frontend/                   # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Upload page
│   │   └── results/
│   │       └── page.tsx        # Results dashboard
│   ├── components/
│   │   ├── FileUpload.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── IssuesTable.tsx
│   │   └── ExportButtons.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
├── amazon-catalog-cli-main/    # Existing CLI library (do not modify)
└── README.md
```

---

## Local Development

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Start the Backend

```bash
# From the project root
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the dev server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

### 2. Start the Frontend

```bash
# In a new terminal, from the project root
cd frontend

# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# .env.local already points to http://localhost:8000 by default

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — returns `{"status":"ok"}` |
| `GET` | `/queries` | List all 9 available query names and descriptions |
| `POST` | `/audit` | Upload CLR file, run all 9 queries, return full JSON |
| `POST` | `/audit/{query_name}` | Upload CLR file, run one specific query, return JSON |

**File upload:** multipart/form-data with field name `file`. Accepts `.xlsx` and `.xlsm` up to 50 MB.

---

## Deploying to Railway (Backend)

1. **Push this entire repository to GitHub.**

2. Go to [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo**.

3. Select your repository.

4. In the Railway service settings:
   - Set **Root Directory** to `backend`
   - Railway will auto-detect `requirements.txt` via Nixpacks

5. Railway will use `railway.json` for the start command automatically.
   The health check path is `/health`.

6. After deployment, copy the generated Railway URL (e.g. `https://your-service.up.railway.app`).

---

## Deploying to Vercel (Frontend)

1. Go to [Vercel](https://vercel.com) → **Add New Project** → import your GitHub repo.

2. In the **Configure Project** screen:
   - Set **Root Directory** to `frontend`
   - Framework preset: **Next.js** (auto-detected)

3. Add the environment variable:
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://your-service.up.railway.app` |

4. Click **Deploy**.

---

## Environment Variables

### Frontend (`frontend/.env.local` or Vercel dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Full URL of the deployed FastAPI backend | `https://my-auditor.up.railway.app` |

If `NEXT_PUBLIC_API_URL` is not set, the frontend defaults to `http://localhost:8000` (local dev).

---

## Audit Checks (9 Queries)

| Query Name | What It Checks |
|------------|---------------|
| `missing-attributes` | Required fields that are completely empty |
| `missing-any-attributes` | Fields missing across any listing |
| `long-titles` | Titles exceeding Amazon's character limit |
| `title-prohibited-chars` | Prohibited characters in titles |
| `rufus-bullets` | Bullet point quality for RUFUS compliance |
| `prohibited-chars` | Prohibited characters across all fields |
| `product-type-mismatch` | SKUs whose product type looks inconsistent |
| `missing-variations` | Variation relationships that are broken |
| `new-attributes` | Fields that appear new or unused |
