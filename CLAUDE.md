# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ActionMetrics is a full-stack monorepo for managing evaluations, objectives, skills, and feedback in educational/organizational settings. Documentation and UI text are in **Spanish**.

## Repository Structure

- `backend-evaluacion/` — Express.js REST API (Node.js, PostgreSQL via Sequelize ORM)
- `front-evaluacion/` — Next.js 15 React frontend (MUI + TailwindCSS, Zustand state, React Query)

## Development Commands

### Backend (`backend-evaluacion/`)
```bash
npm install
npm run dev      # Start with nodemon (port 4001)
npm start        # Production mode
```

### Frontend (`front-evaluacion/`)
```bash
npm install
npm run dev      # Next.js dev server with Turbopack (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Database
- Requires PostgreSQL running locally (default port 5432)
- Run migrations once: `node db/migrate.js` (from backend directory)
- Environment config: copy `.env.example` to `.env` in `backend-evaluacion/`

## Architecture

### Backend Pattern: Controllers → Services → Models
- **Controllers** (`controllers/`) handle HTTP request/response
- **Services** (`services/`) contain business logic (PDF generation, AI integration, report composition)
- **Models** (`models/`) are Sequelize definitions with associations
- **Routes** (`routes/routes.js`) — single file mapping all API endpoints
- **Middleware** (`middleware/`) — JWT auth verification, role-based access, file uploads (multer), department filtering

### Frontend Pattern: Pages → Components → Services → Stores
- **Pages** (`src/pages/`) — Next.js file-based routing
- **Components** (`src/components/`) — organized by domain (dashboard, evaluacion, historial, rendimiento, etc.)
- **Services** (`src/services/`) — API client functions using `authFetch` wrapper
- **Stores** (`src/store/`) — Zustand stores with localStorage persistence (sesionStore, dashboardStore, departamentoStore)
- **Hooks** (`src/hooks/useQueries.js`) — TanStack React Query hooks for data fetching

### Authentication Flow
- JWT tokens stored in **httpOnly cookies** (set by backend on login)
- `authFetch` (`src/services/authFetch.js`) wraps all authenticated requests with `credentials: 'include'`
- On 401 response, authFetch clears session and redirects to `/`
- `AuthGuard` component protects authenticated pages

### Role-Based Access
- `id_rol = 1`: Admin (department-scoped)
- `id_rol = 2`: Employee
- `id_rol = 3`: Super Admin (system-wide)

### Key Domain Models & Relations
- `Usuario` 1:N `Evaluacion`, M:1 `Departamento`, M:1 `Rol`
- `Evaluacion` N:M `Habilidad` (via `resultado_habilidad`)
- `Objetivo` M:1 `Usuario`, M:1 `TipoObjetivo`
- `Retroalimentacion` M:1 `Usuario`, M:1 `Evaluacion`
- `PlanMejora` M:1 `Evaluacion`

### API Communication
- Base URL: `http://localhost:4001/api` (configured in `src/config/config.js`)
- Standard response format: `{ ok: boolean, data: any, message: string }`
- All routes prefixed with `/api/` (auth, usuarios, evaluaciones, objetivos, reportes, retroalimentacion, departamentos)

### AI Integration
- Uses the OpenAI SDK against OpenAI-compatible APIs (DeepSeek by default) for generating improvement plans
- Service: `backend-evaluacion/services/aiService.js`; it calls `aiPool.chatCompletion()` from `services/aiProviderPool.js`
- The pool rotates API keys/providers configured in `.env` (`<PROVIDER>_API_KEYS`, `<PROVIDER>_MODEL`, `AI_PROVIDERS`, `AI_ROTATION`) and fails over on 429/402/401/5xx/timeouts; with no keys it falls back to a simulated analysis
- Tests: `npm test` (pool, with a fake OpenAI-compatible server) and `npm run test:security` (API, needs a running backend + DB)

### Security
- Sensitive DB fields are encrypted at rest with AES-256-GCM (`services/dataEncryption.js`, key in `DATA_ENCRYPTION_KEY`): models declare them with `encryptedAttribute(table, field)`, which encrypts on set and decrypts on get, so API responses carry plain text. They can't be used in SQL `WHERE`/`ORDER BY` (filter in JS after loading), and `raw: true` queries return ciphertext. `db/cifrar-datos.js` encrypts legacy rows / rotates keys (`DATA_ENCRYPTION_OLD_KEYS`)
- Rate limiting: 500 req/15min global, 20 auth attempts/15min
- Helmet security headers, CORS via `CORS_ORIGINS` env var
