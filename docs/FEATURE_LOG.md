# LifeOS - Feature Log

This file tracks implemented features, major changes, technical decisions, and known issues.

## [v0.1.0] - Foundation Planning - 2026-08-01

### Added
- Created foundational project documentation (`PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `CODING_RULES.md`, `FEATURE_LOG.md`).

### Technical Decisions
- **Initialization:** React/Vite to be initialized directly in the project root, without a `client/` subdirectory.
- **State & Data Fetching:** Removed `react-query` from v1 scope. Using standard `useState`, `useEffect`, and custom hooks to keep dependencies minimal.
- **Icons:** Decided on `lucide-react` as the single, exclusive icon library.
- **Authentication Scope:** Confirmed support for multiple authenticated users using strict Supabase RLS (`user_id` matching) to isolate personal data safely.
- **Routine Management:** Replaced the concept of server-side "resets" with date-based completion records (daily mapped to current local date, weekly mapped to week-start date).
- **File Storage:** Mandated private Supabase Storage buckets for all personal documents with strict authenticated access policies. No public URLs.
- **Component Naming:** Standardized UI component naming to generic names (`Button.jsx`, `Card.jsx`) while strictly enforcing the global sharp-edge (`rounded-none`) design system across the application.

### Known Issues
- None.

## [v0.1.1] - Phase 1: Project Initialization - 2026-08-01

### Added
- Initialized React with Vite in the root directory.
- Installed approved dependencies (`react`, `react-router-dom`, `@supabase/supabase-js`, `lucide-react`, `tailwindcss@3`).
- Established foundational folder structure (`src/components/ui/`, `src/hooks/`, `src/services/`, etc.).
- Created `src/lib/supabaseClient.js` reading from `.env`.
- Configured Tailwind CSS with strict sharp-edge rules and a global color palette.
- Created a basic boot screen in `App.jsx` to verify Tailwind, React, and Lucide Icons.

### Technical Decisions
- **Tailwind Version:** Used Tailwind v3 to cleanly support the established `tailwind.config.js` patterns and `postcss` configuration without unexpected v4 ESM warnings.
- **Initialization:** Successfully avoided a `/client` subfolder and kept `docs/` intact.

## [v0.2.0] - Phase 2: Application Shell & UI System - 2026-08-01

### Added
- Reusable UI Components (`Button`, `Card`, `Input`, `Textarea`, `Select`, `Modal`, `ConfirmDialog`, `EmptyState`, `LoadingState`, `ErrorState`, `PageHeader`).
- `MainLayout` wrapping all authenticated/core routes.
- Responsive `Sidebar` with collapsible navigation groups (Personalization, Daily Chores, Professional).
- Responsive `Topbar` with mobile hamburger menu and dynamic page title tracking.
- React Router configuration in `App.jsx` mapping all module routes.
- Placeholder React components generated for all 16 pages/routes.

### Technical Decisions
- **Strict Sharp-Edge UI:** Enforced `rounded-none` across every single reusable UI component. Audited all `className` attributes to ensure zero instances of `rounded-sm`, `rounded-md`, or `rounded-lg`.
- **Responsive Drawer:** Built the mobile sidebar drawer purely using React state and Tailwind (no external drawer libraries).
- **Navigation State:** Sidebar intelligently closes on mobile when a leaf route is clicked, but remains open on desktop.

## [v0.3.0] - Phase 3B: Authentication - 2026-08-02

### Added
- `authService.js` for handling Supabase sign in/out operations.
- `AuthContext.jsx` and `useAuth.js` hook for global session state management.
- `ProtectedRoute.jsx` component to intercept and secure all core application routes.
- Public `/login` route mapping to the new `Login.jsx` screen.
- Sidebar logout action using `lucide-react`.

### Technical Decisions
- **Missing Signup:** Intentionally excluded signup and forgot-password flows, as this is a private personal application and accounts are created manually via the Supabase Dashboard.
- **Fail-Fast Environment:** Modified `supabaseClient.js` to throw hard errors if environment variables are missing during startup, preventing silent runtime failures.
- **Client Session Persistence:** Deferred all token handling to Supabase's native `onAuthStateChange` listener to avoid manual/custom token storage bugs.
- **Removed scaffolding script:** Deleted `create-pages.js` as the temporary scaffold is complete and no longer needed for development.

## [v0.4.0] - Phase 4: Database Setup - 2026-08-02

### Added
- Created unified SQL migration `001_initial_schema.sql` implementing exactly 16 planned tables.
- Applied ON DELETE CASCADE for routine completions.
- Applied `EXISTS` subqueries to routine completions RLS policies to prevent cross-user routine hijacking.
- Ensured all RLS policies strictly use `TO authenticated`.

### Technical Decisions
- **Manual Execution:** SQL migration was explicitly verified and executed manually in the Supabase Dashboard, proving out table schemas and RLS policies independently.

## [v0.5.0] - Phase 5A: Daily Routines CRUD - 2026-08-02

### Added
- `src/services/dailyRoutinesService.js` for interacting securely with Supabase `daily_routines`.
- `useDailyRoutines.js` hook managing state, loading, and error handling for CRUD operations.
- Built a dynamic `DailyRoutines.jsx` UI utilizing reusable layout components, a modal for Add/Edit, and a confirmation dialog for Delete.

### Technical Decisions
- **Strict RLS Testing:** Routines are read/written exclusively using the authenticated client; the database implicitly enforces isolation.
- **No Early State:** Explicitly deferred implementation of completion checkboxes, streaks, and history until Phase 5B.
- **UI Consistency:** Reverified that `rounded-none` is preserved and all new UI forms follow the exact sharp-edge design system.
- **Schema Mismatch Correction:** Discovered that Phase 5A React code requires `description` and `is_active` fields on `daily_routines`. Prepared migration `002_add_daily_routine_fields.sql` (STATUS: PREPARED / NOT YET APPLIED) to resolve the mismatch safely without modifying the already executed `001_initial_schema.sql`.

## [v0.6.0] - Phase 5B: Daily Routine Completion Tracking - 2026-08-02

### Added
- `src/utils/dateUtils.js` for safe local ISO date generation (`YYYY-MM-DD`), avoiding UTC-shift bugs.
- `dailyRoutineCompletionsService.js` for handling date-based completion records in Supabase.
- `useDailyRoutineCompletions.js` hook managing state, optimistic UI toggles, and saving states.
- Separated `DailyRoutines.jsx` into "DAILY CHECKLIST" and "MANAGE ROUTINES" sections.
- Simple date navigation (Prev Day, Calendar Picker, Next Day, Today) integrated into the checklist.
- Textual progress summary (X of Y completed) derived purely from active routines and completion state.

### Technical Decisions
- **Optimistic UI:** Used optimistic toggling in the checklist, reverting only if Supabase throws an error, to ensure high responsiveness.
- **Future Dates:** Disabled the "Next Day" button if navigating would exceed the user's current local date.
- **Strict Isolation:** Prevented `daily_routine_completions` fetches from pulling historical mass data; fetches only the `routine_id` array for the currently selected local date.

## [v0.7.0] - Phase 6A: Weekly Routines CRUD - 2026-08-05

### Added
- `src/services/weeklyRoutinesService.js` for interacting securely with Supabase `weekly_routines`.
- `useWeeklyRoutines.js` hook managing state, loading, and error handling for CRUD operations.
- Built `WeeklyRoutines.jsx` UI using existing layout patterns, supporting Add, Edit, Delete, and listing of weekly routine definitions.
- Supported active/inactive toggle status for weekly routines.

### Technical Decisions
- **Schema Mismatch Detection:** Detected missing `description` and `is_active` fields on `weekly_routines` table before building the UI. Created `003_add_weekly_routine_fields.sql` and allowed manual user execution before continuing.
- **Separation of Concerns:** Purposely omitted weekly checklist tracking (deferred to Phase 6B) to ensure the CRUD logic remained isolated and focused.
- **UI Consistency:** Ensured no rounded classes were introduced, preserving the sharp-edge UI paradigm. Kept daily routines unmodified.

## [v0.8.0] - Phase 6B: Weekly Routine Completion Tracking - 2026-08-05

### Added
- Added week-based utilities `getWeekStartDate`, `getWeekEndDate`, `formatWeekRange`, and `addWeeks` to `src/utils/dateUtils.js`.
- Created `weeklyRoutineCompletionsService.js` and `useWeeklyRoutineCompletions.js` to manage reading/writing completions to Supabase securely.
- Integrated a new "THIS WEEK / WEEKLY CHECKLIST" section dynamically above the Manage Routines section in `WeeklyRoutines.jsx`.
- Added optimistic UI toggling with complete rollback on network failure.
- Implemented week navigation (Previous Week, This Week, Next Week) with future week blocking.

### Technical Decisions
- **No-Reset Architecture:** Built tracking against persistent database records assigned to Monday start dates (`YYYY-MM-DD`). A new week naturally has an empty checklist because it lacks rows for that week's start date, effectively eliminating all need for complex midnight cron jobs or reset logic.
- **Historical Edits:** Users can navigate to past weeks and check/uncheck historical completion data seamlessly, leaving current weeks entirely unaffected.
- **Local Date Handling:** Ensure `dateUtils.js` operates purely on local time by safely parsing `YYYY-MM-DD` strings in local mode (via explicit component parsing rather than `new Date("YYYY-MM-DD")` which triggers UTC shifts).

## [v0.8.1] - Bug Fix — ConfirmDialog callback contract - 2026-08-05

### Fixed
- Fixed an `onClose is not a function` runtime error thrown by `ConfirmDialog` when deleting routines. The component now accepts `onCancel`, `confirmLabel`, `cancelLabel`, and `isLoading` to correctly match the prop contract provided by `DailyRoutines` and `WeeklyRoutines`.
- Dialog handles loading states natively by passing `disabled={isLoading}` to its action buttons, preventing double-clicks and unexpected closures while waiting for Supabase deletes.

## [v0.9.0] - Phase 7A: Daily Outfits - 2026-08-05

### Added
- `src/services/dailyOutfitsService.js` providing simple CRUD operations on the `daily_outfits` table.
- `useDailyOutfits.js` custom hook for managing local component state against Supabase.
- Built `DailyOutfits.jsx` dynamically rendering today's outfit or an empty state, with a fully functioning local-date navigation.
- Added Add/Edit Modal and used the fixed `ConfirmDialog` for delete protection.

### Technical Decisions
- **Database Mismatch Check:** Verified that `daily_outfits` already perfectly supported the approved feature concept without needing a migration.
- **Future Planning Allowed:** Unlike Daily Routines, the Daily Outfits UI allows uninhibited forward date navigation, enabling users to log an outfit for "tomorrow" successfully.
- **Enforced Constraints:** Exclusively fetches `.single()` and relies on the unique key constraint `UNIQUE(user_id, worn_date)` to ensure identical UI behavior for creating vs. updating the same single outfit.
- **No Relational Logic:** Explicitly ignored complex Wardrobe features (shoes table, colors table, closet inventory) to keep the app strictly simple.

## [v0.9.1] - Bug Fix — Daily Outfits empty-date query corrected - 2026-08-05

### Fixed
- Fixed a 406 Not Acceptable console error when navigating to dates with no outfit records. Changed Supabase query from `.single()` (which throws PGRST116 when zero rows exist) to `.maybeSingle()` (which elegantly returns `null`).
- Removed the obsolete `PGRST116` error workaround, allowing empty states to be handled natively without producing HTTP errors.
- Maintained the strict `UNIQUE(user_id, worn_date)` database integrity.

## [v0.10.0] - Phase 7B: Wishlist / Dreams - 2026-08-06

### Added
- `src/services/wishlistService.js` for interacting securely with Supabase `wishlist_items`.
- `useWishlist.js` hook managing local state for CRUD operations.
- Built `Wishlist.jsx` UI replacing the placeholder. It features a responsive grid to dynamically display wishlist items, robust empty/loading states, and standard Add/Edit/Delete actions.
- Added support for item prioritization, estimated pricing, and purchased status tracking via checkboxes.

### Technical Decisions
- **No Schema Changes:** The `wishlist_items` schema perfectly mapped the required functionality, so no new migration was created. 
- **Strict UI Validation:** Added numeric float parsing for the optional `estimated_price` field directly in the UI to ensure the Supabase `numeric` type remains satisfied.
- **Isolated Module:** Kept the wishlist entirely isolated. No links to out-of-scope inventory, external APIs, or other modules. Used existing `ConfirmDialog` and `Modal` safely.

## [v0.11.0] - Phase 7C: To Give - 2026-08-06

### Added
- `src/services/toGiveService.js` for interacting securely with Supabase `to_give`.
- `useToGive.js` hook managing local state for CRUD operations.
- Built `ToGive.jsx` UI replacing the placeholder. Features a responsive grid displaying payables, robust empty/loading states, and standard Add/Edit/Delete actions.
- Used `formatCurrencyINR` utility to natively display currency amounts correctly in the Indian Rupee format, leaving the database purely numeric.

### Technical Decisions
- **No Schema Changes:** The `to_give` schema perfectly mapped the required functionality with its `Pending` and `Paid` constraints.
- **Safe Empty State:** Ensured the service used standard `.select('*')` without `.single()`, ensuring zero items correctly evaluated to an empty array without generating 406 network errors.
- **Strict Labels:** Wrapped all form inputs in `div`s with clear native `<label>` elements for full accessibility and UI clarity.

## [v0.11.1] - UI Refactor — Daily Outfits, Wishlist, To Give - 2026-08-06

### Changed
- Standardized the record-management UI. Refactored Wishlist and To Give from a card grid to a full responsive table layout (`overflow-x-auto`).
- Daily Outfits was migrated to the table layout pattern and refactored from a single-outfit-per-date system to allowing multiple outfits per date.
- Dropped the `UNIQUE(user_id, worn_date)` constraint in Supabase via migration `004_drop_daily_outfits_unique_constraint.sql`.
- Updated `useDailyOutfits.js` and `dailyOutfitsService.js` to return and manage arrays of outfits rather than a single object.

## [v0.12.0] - Phase 7D: To Get - 2026-08-06

### Added
- `src/services/toGetService.js` for interacting securely with Supabase `to_get`.
- `useToGet.js` hook managing local state for CRUD operations.
- Built `ToGet.jsx` UI replacing the placeholder. Features a responsive table displaying receivables, robust empty/loading states, and standard Add/Edit/Delete actions.
- Used `formatCurrencyINR` utility to natively display currency amounts correctly in the Indian Rupee format, leaving the database purely numeric.

### Technical Decisions
- **No Schema Changes:** The `to_get` schema perfectly mapped the required functionality with its `Pending` and `Received` constraints.
- **Symmetric Architecture:** Architected To Get as an independent module that perfectly mirrors the To Give table layout and state management, without incorrectly coupling them.
- **Safe Fetching:** Used standard `.select('*')` to ensure safe empty states without 406 HTTP errors.

## [v0.12.1] - UI Enhancement — Financial Totals - 2026-08-06

### Added
- Added a financial summary section to the **To Give** and **To Get** modules.
- Displays Total, Pending, and Paid/Received amounts directly above the table.
- Values are dynamically calculated via JavaScript `.reduce()` from the existing state arrays, ensuring instant UI updates upon CRUD operations.
- Values formatted safely using `formatCurrencyINR()`.

### Technical Decisions
- **No Database Changes:** Refused to add summary columns to the database or rely on RPC calls. Computations are inexpensive and handled purely on the client side based on currently loaded data.
- **Strict UI Alignment:** Maintained the strict `rounded-none` sharp UI styling for the summary grids. Used a simple responsive `grid-cols-1 sm:grid-cols-3` layout without horizontal overflow.

## [v0.13.0] - Phase 7E: Credentials - 2026-08-06

### Added
- `src/services/credentialsService.js` for interacting securely with Supabase `credentials` table.
- `useCredentials.js` hook managing local state for CRUD operations.
- Built `Credentials.jsx` UI replacing the placeholder. Features a responsive table, empty states, and standard Add/Edit/Delete actions.
- Passwords display masked by default (`••••••••`) using local React state to toggle visibility per-row.
- Implemented a Copy button utilizing the browser's clipboard API `navigator.clipboard.writeText`.

### Technical Decisions
- **Intentional Plaintext Storage:** Explicitly ignored previously investigated AES/PBKDF2 encryption patterns. Decided to store passwords directly as plaintext in the `encrypted_password` column by design to keep the personal OS simple.
- **Security Scope:** Relies entirely on Supabase Auth + RLS for data isolation. Does not protect against database leaks.
- **No Schema Changes:** The existing `credentials` schema was perfectly suited and did not require modifications or migrations.

## [v0.13.1] - Credentials Categorization - 2026-08-06

### Added
- Created and executed migration `005_add_credentials_category.sql` adding a `category` column to the `credentials` table (`Personal` or `Professional`).
- Added filtering tabs above the credentials table (All, Professional, Personal) with dynamic, client-side counters.
- Updated Add/Edit modals to use the shared `Select` component for categorizing credentials.
- Updated the table UI to display the category using sharp-edged status badges.

### Technical Decisions
- **Client-Side Filtering:** Chosen to filter the already-loaded `items` array locally rather than making network requests per tab switch, ensuring instant UI responses.
- **Safe Defaults:** The database migration forces existing rows to `Personal` safely, preventing any `NULL` states.

## [v0.13.2] - Expanded Credentials Categories - 2026-08-06

### Added
- Expanded the allowed credential categories from 2 to 20 via migration `006_expand_credentials_categories.sql` (e.g., Banking & Finance, IT & Devices, Railway & Travel).
- Replaced the three fixed filter buttons with a unified dropdown filter initialized to 'All Categories'.
- Updated Add and Edit forms to support the 20 new categories via the `Select` component, defaulting to `Personal` for new credentials.
- Updated the table rendering to comfortably display the extended category names within a sleek, sharp-edged status label.

### Technical Decisions
- **No Automatic Migration:** Decided against bulk-updating existing credentials. Existing credentials gracefully retain their 'Personal' or 'Professional' tags until the user manually categorizes them.
- **Client-side Filtering:** Upgraded the filtering logic to cleanly operate strictly over the previously fetched `items` array using the new Select dropdown without making round-trips to the database.

## [v0.13.3] - Credentials Search - 2026-08-06

### Added
- Added client-side search functionality exclusive to the Credentials module.
- Search instantly matches against App / Service, Username / Email, Category, and Notes.
- Search seamlessly chains with the existing Category filter (e.g., searching within "IT & Devices").
- Empty states gracefully handle situations where search + category yields 0 results.

### Security & Design Decisions
- **Excluded Password Field:** Explicitly excluded `encrypted_password` from the search criteria to ensure plaintext passwords cannot be accidentally matched or discovered through searching.
- **Client-side:** Search is executed completely in-memory against the already-fetched `items` array to maintain instant UX without Supabase round-trips.
- **Strict UI:** Adhered to the sharp-edged LifeOS design patterns; no rounded classes were used. The search area was styled as a seamless horizontal professional toolbar containing an inline left-aligned search icon, stripping away redundant labeling.

## [v0.13.4] - Global Scrollbar & Layout Stability - 2026-08-06

### Added
- Created a global professional scrollbar style in `index.css` applying a thin, understated slate/gray track and thumb to the entire application, consistent with the LifeOS color scheme.
- Prevented layout shifting (width jumping) during search filtering by applying `scrollbar-gutter: stable` to the root scroll container (`MainLayout.jsx`).

### Technical Decisions
- **CSS-Only Solution:** Solved the layout jumping using native CSS `scrollbar-gutter` instead of JavaScript calculations, hacky padding modifications, or third-party scrollbar libraries.
- **Sharp Edge Enforcement:** Maintained strict LifeOS design language by enforcing `border-radius: 0` explicitly on the new webkit scrollbar thumb.
- **Cross-browser Compatibility:** Configured both `::-webkit-scrollbar` pseudoclasses for Chrome/Safari/Edge and standard `scrollbar-width`/`scrollbar-color` properties for Firefox support.

## [v0.14.0] - Phase 7F: Documents - 2026-08-06

### Added
- `src/services/documentsService.js` handling all interactions with Supabase `personal_documents` table and `user-documents` Storage bucket.
- `useDocuments.js` hook managing local React state, optimistic rendering, and loading/error handling.
- Built `Documents.jsx` UI utilizing a professional horizontal search and filtering toolbar.
- Fully integrated file uploading to a private Supabase Storage bucket.
- Implemented robust upload architecture ensuring that if database metadata insertion fails, the orphaned Storage file is immediately rolled back via a `.remove()` call.
- Safe filename sanitization logic prefixed with `crypto.randomUUID()` to prevent path manipulation attacks or naming collisions.
- Restricted file uploads strictly to PDF, Image, Word, and Excel files with a hard client-side 1MB size limit.
- Action to download/view files seamlessly generates a secure, short-lived 60-second signed URL for private access without relying on public bucket exposure.
- Delete flow safely completely cleans up both the binary file in Storage and the `personal_documents` metadata database record synchronously.

### Technical Decisions
- **Private Storage:** Confirmed that `user-documents` is entirely private, and that Storage RLS correctly restricts ownership and limits access.
- **Client-Side Filtering:** Search and category operations execute perfectly in-memory without making secondary network requests.
- **No File Replacement:** To avoid orphaned objects and caching complexities, editing a document strictly limits modification to metadata only (Document Name, Category, Expiry Date, Notes). If a user wishes to update the binary file, they simply delete and recreate the record.
- **Strict UI Constraints:** Maintained `rounded-none` sharp boundaries across all new UI structures, reusing the standard LifeOS table format layout seen in Credentials.

## [v0.15.0] - Phase 7G: Annual Trips - 2026-08-06

### Added
- `src/services/annualTripsService.js` handling all interactions with the Supabase `annual_trips` table securely.
- `useAnnualTrips.js` hook managing local React state, loading states, and error handling for all trip operations.
- Built `Trips.jsx` replacing the placeholder. Features a professional data grid displaying trips and a dynamic financial summary bar.
- Implemented robust dynamic status calculation (Upcoming, Ongoing, Completed) completely on the client side without storing it in the database. 
- Automatically interprets trips without an end date as single-day journeys during duration and status evaluation.
- Added comprehensive client-side dynamic chaining filters for Year, Category, Status, and Search keywords without generating database round-trips.
- Added four independent expense fields (Fuel, Food, Stay, Other) in the modal and aggregated them mathematically into a unified "Total Cost" display.
- Enforced strict sharp-edged (no border radius) UI constraints across the summary metrics and form inputs.

### Technical Decisions
- **Derived Year Processing:** Instead of adding an unnecessary `year` column to the schema, the Year filter generates its available options strictly by mapping the existing `start_date` values currently loaded in state.
- **Duration Algorithm:** Calculated precisely via local date math using `parseLocalDate` to prevent UTC timestamp bugs, safely outputting `X days` unconditionally inclusive of the start date.
- **Null Safety on Expenses:** Normalizes any blank expense inputs to `0` prior to Supabase insertions, satisfying the `check (cost >= 0)` constraints safely and gracefully preventing `NaN` totals.
- **Migration `009` Execution:** Applied the predefined `009_add_annual_trips_category.sql` which enforces an 8-option category system natively on the database layer.

## [v0.16.0] - Phase 8A: Vehicles - 2026-08-06

### Added
- `src/services/vehiclesService.js` handling all interactions with the Supabase `vehicles` table securely via `auth.uid() = user_id`.
- `useVehicles.js` hook managing local React state, loading states, and error handling for all vehicle operations.
- Built `Vehicles.jsx` replacing the placeholder with a responsive Card-based interface suitable for personal vehicle tracking.
- Added comprehensive derived health-status algorithms for Insurance, PUC, and Service milestones without storing stale states in the database.
- Visual status indicators (`Healthy`, `Due Soon`, `Overdue`) using a 30-day lookahead window evaluated strictly against the user's local timezone.
- Added independent filtering by Vehicle Type and aggregated Health Status.

### Technical Decisions
- **No Refetching:** `useVehicles.js` intelligently mutates the local array upon successful creations, edits, and deletions to minimize unnecessary Supabase network requests.
- **Client-Side Derivations:** `getVehicleOverallHealth` calculates a single worst-case unified status per vehicle (Overdue > Due Soon > Healthy) to power the top Action Required summary and Health Dropdown filter.
- **Card-Based UI:** Chosen over a data table because vehicles are low-volume personal assets; cards allow for prominent vertical grouping of critical milestones.

## [v0.17.0] - Phase 8B: Important Items - 2026-08-06

### Added
- `src/services/importantItemsService.js` handling strictly authenticated CRUD operations against the Supabase `important_items` table.
- `useImportantItems.js` hook managing React state and intelligent mutation without full network refetches.
- Replaced the placeholder `ImportantItems.jsx` with a complete responsive Card-based layout.
- Added comprehensive dynamic Warranty Status calculations (`Active`, `Expiring Soon`, `Expired`) evaluated entirely on the frontend using local-timezone rules.
- Included an Aggregated Summary displaying Total Items, Total Financial Value (INR formatted), and Action Required (warranties needing attention).
- Advanced client-side search filtering across Item Name, Storage Location, Notes, and Categories.
- Implemented robust `Add` and `Edit` modals explicitly configured to translate empty optional fields into clean database `null` values.

### Technical Decisions
- **File Avoidance:** `bill_file_path` and `warranty_file_path` are deliberately unmanaged in this phase to strictly bound the scope to textual CRUD.
- **Derived Architecture:** Status columns were strictly excluded from the database schema to ensure warranty states are never stale.
- **Safe Date Handling:** Handled missing `warranty_expiry_date` cleanly returning `Not Set`, avoiding invalid Date object parsing errors.

## [v0.18.0] - Phase 9A: Meetings (REMOVED) - 2026-08-06

### Removed
- The Professional Meetings feature was deliberately dropped from the LifeOS scope.
- `public.meetings` table completely dropped via Migration 013 to simplify the database footprint.

## [v0.18.1] - Phase 9A: Daily Notes - 2026-08-06

### Added
- `src/services/dailyNotesService.js` strictly enforcing RLS boundaries over the `daily_notes` table.
- `useDailyNotes.js` hook natively sorting the localized cache by `note_date` descending.
- Created robust `DailyNotes.jsx` replacing the empty placeholder with a rich, responsive single-column feed.
- Implemented smart UI routing preventing the user from triggering `UNIQUE(user_id, note_date)` PostgreSQL constraint errors. If a user tries to Add a note on a date that already exists, the UI gracefully switches to the Edit modal for that date.
- Added comprehensive filtering (Case-insensitive keyword search, Month, Year).
- Integrated `Notes This Month` dynamic client-side summary metric.

### Technical Decisions
- **No Migration Required:** Fully adhered to the original constraints inside `001_initial_schema.sql`. Avoided unnecessary bloat by strictly separating `work_completed` and `pending_work` instead of implementing complex Markdown/rich-text.
- **Date Handling Safety:** Directly uses the custom `getLocalIsoDate` and `parseLocalDate` routines to manage `YYYY-MM-DD` shapes without shifting across UTC midnight lines.

## [v0.18.2] - Phase 9B: Attendance - 2026-08-06

### Added
- `src/services/attendanceService.js` strictly enforcing RLS boundaries over the `attendance_records` table.
- `useAttendance.js` hook natively sorting the localized cache by `record_date`.
- Created robust `Attendance.jsx` replacing the empty placeholder with a rich, responsive Monthly Calendar grid.
- Implemented smart UI routing preventing the user from triggering `UNIQUE(user_id, record_date)` PostgreSQL constraint errors. Clicking an unrecorded calendar day seamlessly creates a record, while clicking a recorded day organically opens the Edit/Clear modal.
- Integrated `Present / Absent / Leave...` dynamic client-side summary counters explicitly scoped to the visible month.

### Technical Decisions
- **Legacy Compatibility:** Deliberately preserved the existing `is_submitted` boolean inside the database to avoid destructive `DROP COLUMN` commands, but architected the React frontend to cleanly ignore it.
- **Strict Independence:** Intentionally avoided converting empty calendar weekends into "Holidays" automatically, adhering to the principle that missing records strictly mean "Unrecorded", never "Absent" or "Holiday".
- **Percentage Exclusion:** Deliberately excluded Attendance Percentage calculations to prevent misleading statistics since the system cannot definitively know the user's expected weekly working structure.

## [v0.19.0] - Application Cleanup: Removed Dashboard & Settings - 2026-08-06

### Removed
- `Dashboard` module (`src/pages/Dashboard.jsx` and all related routing).
- `Settings` module (`src/pages/Settings.jsx` and all related routing).

### Changed
- Refactored `App.jsx` default authenticated route (`/`) to intelligently redirect to `/personalization/daily-routines`.
- Stripped empty navigational components from `Sidebar.jsx` and `Topbar.jsx`.

### Technical Decisions
- **No Database Modification:** Investigated the database schemas and confirmed that neither Dashboard nor Settings possessed any independent tables or columns. Thus, no destructive migrations were executed against the `auth.users` configuration. 
- **Preserved Core Login Flow:** Intentionally left `Login.jsx` routing structures intact and relied natively on React Router's `Navigate` to correctly waterfall the user into the Daily Routines module upon successful authentication.

## [v0.19.1] - Application Cleanup: Removed Vehicles & Important Items - 2026-08-06

### Removed
- `Vehicles` module (`src/pages/daily-chores/Vehicles.jsx` and all related routing/services/hooks).
- `Important Items` module (`src/pages/daily-chores/ImportantItems.jsx` and all related routing/services/hooks).
- The `Daily Chores` category on the sidebar entirely, due to it being emptied out.
- Prepared Migration `015_remove_vehicles_important_items.sql` to systematically drop `public.vehicles` and `public.important_items`.

### Technical Decisions
- **Database Dependency Safety:** Audited the remaining active database schema and confirmed no dependent views or triggers rested on these tables. Excluded `CASCADE` safely.
- **Storage Exclusions:** Verified that no storage buckets were attached to `vehicles` or `important_items`. The unused legacy legacy columns had not been implemented with bucket structures.
- **Historical Migration Preservation:** Intentionally left `010` and `011` intact in the repository to maintain full linear migration provenance.

## [v0.19.2] - Feature: Reminders & Attendance - 2026-08-06

### Added
- Created `reminders` database table with full RLS policies (`016_add_reminders.sql`).
- Created `src/services/remindersService.js` to manage Supabase CRUD for reminders.
- Created `src/hooks/useReminders.js` for local React state management.

### Changed
- Rebuilt `Attendance.jsx` to dynamically inject reminder data into the calendar UI alongside attendance without interfering with the `attendance_records` backend schema.
- Re-architected the `Attendance` modal into a dual-section interface allowing independent management of the day's attendance status and any number of reminders.
- Renamed navigational headers from "Attendance" to "Reminders & Attendance" in the Sidebar and Topbar.
- Implemented inline compact editing for Reminders with quick-toggles for completion.

## [v0.19.3] - Feature: Important Notes - 2026-08-07

### Added
- Created `important_notes` database table (`017_add_important_notes.sql`).
- Added `ImportantNotes.jsx` module under Personalization to serve as a minimalist reference notebook.
- Implemented `useImportantNotes.js` and `importantNotesService.js` for RLS-secured CRUD operations.
- Added localized case-insensitive search filtering across `heading` and `content`.

## [v0.20.0] - Phase 11: Expense Tracker - 2026-08-07

### Added
- Added new top-level Sidebar group: `Finance`.
- Added `ExpenseTracker.jsx` with full local-date navigation, category filtering, and chronological view.
- Added `Total Spent` summary utilizing the pre-existing `formatCurrencyINR()` logic natively without schema adjustments.
- `useExpenses.js` and `expensesService.js` added.

### Technical Decisions
- **Schema Independence:** Refused to merge with `To Give`/`To Get` tables to preserve strict context boundaries.
- **Strict Validation:** Added `check (amount > 0)` and an exhaustive 8-option category constraint to protect data integrity at the database layer.
- **Responsive Architecture:** Converted traditional data tables into responsive `h-[220px]` Flex Cards with smart line clamping and View Modals, enforcing the new global LifeOS standard format.

## [v0.21.0] - Application Cleanup: Removed Annual Trips - 2026-10-05

### Removed
- `Annual Trips` module (`src/pages/personalization/Trips.jsx`, `src/hooks/useAnnualTrips.js`, `src/services/annualTripsService.js`).
- Route `/personalization/trips` from `src/App.jsx`.
- `Annual Trips` item and `Plane` icon from `src/layouts/Sidebar.jsx`.
- Prepared Migration `019_remove_annual_trips.sql` to systematically drop `public.annual_trips`.

### Technical Decisions
- **Complete Elimination:** Removed UI component, hook, service, and routing to ensure zero orphaned code or unused bundles.
- **Database Cleanliness:** Added migration `019_remove_annual_trips.sql` using `DROP TABLE IF EXISTS public.annual_trips CASCADE` to drop the table and its associated RLS policies cleanly.

## [v0.22.0] - Feature: Daily Outfits (At-a-Glance Wardrobe Tracking) - 2026-10-05

### Added
- **At-a-Glance Wardrobe Metrics**: Displays Total Outfits Logged, Most Worn Top (with repetition frequency), Most Worn Bottom (with repetition frequency), and Top Footwear for the active timeframe.
- **Month & Timeframe Navigation**: Added month navigation controls (`< Prev Month | Month Year | Next Month >`), `This Month` shortcut, and scope tabs (`Selected Month`, `Past 30 Days`, `All Outfits`).
- **Live Search Filtering**: Instant client-side search across tops, bottoms, footwear, notes, and dates.
- **Dual Display Modes**: Toggle between visual Cards Grid View (with relative date indicators like `Today`, `Yesterday`, `X days ago`) and compact chronological Table List View.
- **Dynamic Suggestions**: Autocomplete suggestions derived directly from the full wardrobe dataset.

### Changed
- Refactored `dailyOutfitsService.js` and `useDailyOutfits.js` to fetch and maintain all wardrobe records across months while keeping seamless CRUD capabilities.

## [v0.22.1] - UI Refinement: Daily Outfits Dedicated Table List - 2026-10-05

### Changed
- Removed bottom card list grids completely per user preference.
- Implemented a dedicated, responsive table view listing all dresses and outfits row-by-row chronologically.
- Enhanced table rows with date tags, upper wear icons, lower wear badges, footwear details, notes/occasions, and quick action buttons.
- Retained the top at-a-glance metrics bar, month navigation, time scoping, and live search.



