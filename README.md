# Resolutions

Resolutions is a warm, minimal, journal-inspired productivity app for managing personal goals by category. The app supports:

- user registration and login
- profile management
- fixed category structure
- goal creation, editing, completion toggling, and deletion
- local-first UI with a PWA setup
- FastAPI + PostgreSQL backend persistence

## Tech stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Zustand
- React Router
- Vite PWA plugin

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT authentication
- Async database access

## Project structure

```bash
resolutions-app/
├── backend/
│   ├── app/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── ...
├── src/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── README.md
└── ...
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL running locally or via Docker
- npm
- pip

## 1. Backend setup

Go to the backend folder:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Then start PostgreSQL with Docker:

```bash
docker compose up -d db
```

Start the FastAPI app:

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at:

- http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## 2. Frontend setup

From the project root:

```bash
npm install
npm run dev
```

The app will usually run on:

- http://localhost:5173

## 3. Production build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 4. Default app behavior

The app is designed around a fixed set of 12 categories and user-managed goals within each category. The backend stores the real data in PostgreSQL, while the frontend keeps lightweight local state for temporary UI behavior.

## 5. Authentication flow

The backend provides endpoints for:

- register
- login
- current user profile
- profile updates
- settings updates
- category and goal data

Tokens are issued with JWT and used for protected API requests.

## 6. Environment variables

Backend uses values from `backend/.env`, for example:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/resolutions_db
JWT_SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=http://localhost:5173
APP_ENV=development
```

## 7. Notes

- If the backend is not running, the frontend may fail during authentication or data fetch.
- If you change the backend code, restart the uvicorn process.
- If you run into stale browser data, clear the app-local storage for the frontend domain.

## 8. Useful commands

```bash
# frontend
npm run dev
npm run build
npm run preview

# backend
cd backend
source .venv/bin/activate
PYTHONPATH=. python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
