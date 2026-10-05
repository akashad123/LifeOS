# LifeOS - Project Context

## Project Purpose
LifeOS is a private personal management full-stack application designed to manage daily routines, personal files, daily chores, professional notes, and overall life organization securely. It provides a highly personalized dashboard tailored to the user's specific needs.

## Technology Stack
- **Frontend Framework:** React (initialized via Vite)
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **Icons:** `lucide-react`
- **Backend / BaaS:** Supabase
  - PostgreSQL (Database)
  - Supabase Auth (Authentication)
  - Supabase Storage (Private file storage)
- **State Management:** React Context (for global state like Auth), Custom Hooks with `useState`/`useEffect` (for data fetching). No Redux, no React Query (v1).

## Core Modules
1. **Dashboard**
2. **Personalization:** Daily Routines, Weekly Routines, Daily Outfits, Wishlist, To Give, To Get, Usernames & Passwords, Personal Documents, Important Notes.
3. **Daily Chores:** Vehicles, Important Items Bought.
4. **Professional:** Meetings, Daily Notes, Attendance.
5. **Finance:** Expense Tracker.
6. **Settings:** User settings and preferences.

## Important Product Decisions
- **No Separate Backend:** The app is purely a Vite + React frontend communicating directly with Supabase via the Supabase JS client.
- **Root Initialization:** The React app is initialized in the root directory (no `client/` subdirectory).
- **Date-Based Routine Completions:** Routines do not have server-side midnight "resets". Instead, completion state is tied to specific calendar dates (for daily) or week-start dates (for weekly).
- **Private Data:** All records include a `user_id`. Supabase Row Level Security (RLS) ensures strict isolation between users.
- **Private Storage:** Personal documents and sensitive files are stored in private Supabase Storage buckets, heavily protected by RLS.

## Current Development Status
- Architecture and foundational rules defined.
- Documentation created.
- Phase 1 (Foundation Initialization) completed.
- Phase 2 (Application Shell & UI System) completed.
- Phase 3B (Authentication) completed:
  - Supabase client throws clear errors if config is missing.
  - `AuthContext` provides global session state.
  - `ProtectedRoute` protects all internal routes.
  - Boxy/Sharp `Login` screen implemented.
  - Logout functionality built into Sidebar.
- Phase 4 (Database Schema): 16 tables planned and SQL migration prepared & manually executed.
- Phase 5A (Daily Routines CRUD) completed:
  - Implemented service layer and custom hook for reading, creating, updating, and deleting routines.
  - RLS strictly enforced on user_id.
- Phase 5B (Daily Routine Completion Tracking) completed:
  - Separated Daily Checklist and Manage Routines sections.
  - Added strict date-based tracking tied to user's local date (`YYYY-MM-DD`).
  - Added date navigation controls with future-date blocking.
- Phase 6A (Weekly Routines CRUD) completed:
  - Added service layer and custom hook for reading, creating, updating, and deleting weekly routines.
  - Added active/inactive toggling support in UI.
- Phase 6B (Weekly Routine Completion Tracking) completed:
  - Added strict Monday-to-Sunday week architecture, tied to local dates.
  - No database resets or cron jobs.
  - Added weekly checklist UI and week navigation, blocking future completions.
- Phase 7A (Daily Outfits) completed:
  - Daily outfits implemented with date navigation.
  - Local date logic used for exact one-outfit-per-date constraints.
  - Future dates allowed for outfit planning.
- Phase 7B (Wishlist) completed:
  - Wishlist module implemented with full CRUD.
  - Supports tracking estimated price, priority, purchased status, and notes.
- Phase 7C (To Give) completed:
  - To Give (payables) module implemented with full CRUD.
  - Indian Rupee (INR) formatting utilized natively via utility.
  - Safe zero-record empty state without 406 errors.
- Phase 7D (To Get) completed:
  - To Get (receivables) module implemented with full CRUD.
  - Mirrored table-style UI from To Give.
- Phase 7E (Credentials) completed:
  - Simple credential manager implemented with plaintext storage by design.
  - Added UI masking (Show/Hide) and clipboard copy functionality.
- Phase 7F (Documents) completed:
  - Private Supabase Storage bucket (`user-documents`) created and bound to RLS policies.
  - Implemented secure file upload with rollback on metadata failure.
  - 1MB per file limit with safe filename sanitization.
  - Generates short-lived (60s) signed URLs for private viewing/downloading.
- Phase 7G (Annual Trips) completed:
  - Added trip planning and expense tracking module.
  - Implemented client-side duration and status calculations based on `start_date` and `end_date`.
  - Added financial summary and advanced multi-filtering (Year, Category, Status).
- Phase 8A (Vehicles) completed:
  - Prepared and applied Migration 010 to safely expand vehicle types and tracking dates.
  - Implemented card-based interface with comprehensive local health date calculations (Insurance, PUC, Service).
  - Maintained sharp UI boundaries and strict RLS scoping.
- Phase 8B (Important Items) completed:
  - Built responsive card-based layout for personal asset management.
  - Implemented completely dynamic frontend warranty calculation algorithms.
  - Integrated aggregated Summary (Total Items, Total Value, Action Required).
  - Explicitly avoided Supabase Storage for files to keep scope contained.
- Phase 9A (Meetings) REMOVED / DROPPED FROM SCOPE:
  - Intentionally removed entirely from the LifeOS roadmap and application. Migration 013 handles complete DB cleanup.
- Phase 9A (Daily Notes) completed:
  - Built a structured daily wrap-up UI natively using the `UNIQUE(user_id, note_date)` constraints from the original `001_initial_schema.sql`. No migration was needed.
  - Implemented intelligent duplicate-date prevention in the UI that smoothly transitions into an Edit modal rather than throwing PostgreSQL errors.
  - Enforced single-column responsive feed design for comfortable long-form text reading.
- Phase 9B (Attendance) completed:
  - Built a 7-column Monthly Calendar layout natively representing daily statuses (`Present`, `Leave`, `Holiday`, etc.).
  - Preserved the existing `is_submitted` boolean entirely but strictly isolated the frontend from it.
  - Implemented cell-based CRUD ensuring unrecorded days remain neutral and aren't assumed to be `Absent` or `Holiday`.

### Final Cleanup
- **Dashboard & Settings**: Intentionally removed from the final LifeOS scope since they served no actual module functionality. Default route handles `/personalization/daily-routines`.
- **Vehicles & Important Items**: Permanently removed from the codebase and database. The "Daily Chores" category was also dismantled due to being empty.
- No Supabase migration was required for Dashboard/Settings, but **Migration 015** handles dropping `vehicles` and `important_items` cleanly.

### Phase 9C: Reminders Integration
- Successfully merged Reminders into the existing `Attendance.jsx` calendar without tangling the database schema.
- **Migration 016** implemented the independent `reminders` table, preserving pure `record_date` usage across both services.
- Introduced side-by-side data management where a given calendar cell displays up to 2 reminder previews below the primary Attendance status bubble.
- Both Attendance and Reminders are managed independently within the same Date click modal without race conditions.

### Phase 10: Important Notes
- Implemented a minimalist `Important Notes` module under Personalization for storing permanent reference information.
- Created `important_notes` table in Supabase via Migration `017_add_important_notes.sql` with only `heading` and `content` text fields.
- Implemented simple responsive card-based UI with inline search functionality without requiring extensive categorizations, tags, or rich text editing.

### Phase 11: Expense Tracker
- Introduced a new top-level `Finance` sidebar category containing `Expense Tracker`.
- Prepared and applied Migration `018_create_expenses.sql` with strict > 0 amount checking and fixed categories.
- Implemented a month/year-based grid layout calculating running totals securely and natively reusing INR formatting logic.

### Phase 12: Removal of Annual Trips
- Completely removed the `Annual Trips` module from the application and codebase per user request.
- Removed `Trips.jsx`, `useAnnualTrips.js`, `annualTripsService.js`, and navigation routes/sidebar links.
- Created Migration `019_remove_annual_trips.sql` to cleanly drop the `annual_trips` table.

