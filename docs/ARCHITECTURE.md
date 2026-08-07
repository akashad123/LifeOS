# LifeOS - Architecture

## Frontend Architecture
- **Framework:** React 18+ (via Vite).
- **Routing:** React Router DOM (v6+), handling protected routes and layout wrappers.
- **Data Fetching:** Custom hooks utilizing `useState` and `useEffect` wrapping Supabase service calls. No external data caching libraries like `react-query` in v1 to keep dependencies minimal.

## Folder Structure
```text
/
├── public/          # Static public assets
├── src/
│   ├── assets/      # Local images, global CSS
│   ├── components/  # Reusable UI elements (ui/) and feature-specific components
│   ├── context/     # React Context providers (e.g., AuthContext)
│   ├── hooks/       # Custom React hooks (e.g., useRoutines, useAuth)
│   ├── layouts/     # Page layouts (e.g., MainLayout with Sidebar)
│   ├── pages/       # Route-level components corresponding to modules
│   ├── services/    # Pure functions for Supabase API interactions
│   ├── utils/       # Helper functions (e.g., date formatting)
│   ├── App.jsx      # Main application router
│   └── main.jsx     # Entry point
├── docs/            # Project documentation (this folder)
├── tailwind.config.js
└── vite.config.js
```

## Module Boundaries
- **UI Components:** Strictly presentational, completely decoupled from Supabase queries.
- **Services (`src/services/`):** Purely responsible for interacting with Supabase (CRUD operations, Auth, Storage).
- **Hooks (`src/hooks/`):** Orchestrate state (`data`, `isLoading`, `error`) and call services. They bridge the gap between UI components and services.

## Authentication Flow
- Handled entirely via Supabase Auth (Email/Password).
- `AuthContext` provides the current authenticated user session globally.
- Protected routes redirect unauthenticated users to the Login page.
- All database records are strictly tied to a `user_id`.

## Supabase Integration Approach
- **Database:** PostgreSQL with RLS. Every table involving personal data must have a `user_id` column. RLS policies must strictly restrict users to their own records.
- **Storage:** Private buckets for all file uploads. RLS ensures only the owner can read/write their files. Pre-signed URLs or authorized Supabase Storage client methods will be used to access files securely. No public buckets.

## Routine Completion Architecture
- **No Resets:** We do not execute nightly resets (cron jobs, edge functions).
- **Daily Routines:** Completion state is stored in a separate table mapping `routine_id` and `date`. The UI fetches the list of routines and the completion records for the *current local date*. If no completion record exists for today, it appears incomplete.
- **Weekly Routines:** Similar logic, but completion state maps to the start date of the current week.
- This maintains historical data and keeps the frontend entirely stateless regarding cron jobs.
