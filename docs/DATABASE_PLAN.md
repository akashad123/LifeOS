# LifeOS Database Plan (Phase 4A)

> [!WARNING]
> **STATUS: PLANNING ONLY / NOT YET IMPLEMENTED**
> This document outlines the proposed database structure. No tables, policies, or buckets have been created in Supabase yet.

## 1. Complete Proposed Table List

Total Tables: 17

**Personalization:**
1. `daily_routines`
2. `daily_routine_completions`
3. `weekly_routines`
4. `weekly_routine_completions`
5. `daily_outfits`
6. `wishlist_items`
7. `to_give`
8. `to_get`
9. `credentials`
10. `personal_documents`
11. `annual_trips`

**Daily Chores:**
12. `vehicles`
13. `important_items`

**Professional:**
14. `meetings`
15. `daily_notes`
16. `attendance_records`

**Finance:**
17. `expenses`

## 2. Table Definitions

*Note: All tables implicitly require `user_id` to enforce RLS isolation, and standard timestamp columns.*

### Common Columns (Every Table)
- `id`: `uuid` (Primary Key, Default: `gen_random_uuid()`)
- `user_id`: `uuid` (Not Null, Foreign Key to `auth.users`, or simply utilized in RLS where `auth.uid() = user_id`)
- `created_at`: `timestamptz` (Default: `now()`)
- `updated_at`: `timestamptz` (Default: `now()`)

### 2.1 Personalization

#### A. Daily Routines
**`daily_routines`** (Persistent definitions)
- `name`: `text` (Not Null)
- `description`: `text` (Nullable)
- `is_active`: `boolean` (Not Null, Default: true)
- *Purpose:* Stores the list of habits (e.g., "Lip Drills").  

**`daily_routine_completions`** (Historical records)
- `routine_id`: `uuid` (Not Null, Ref: `daily_routines`, ON DELETE CASCADE)
- `completed_date`: `date` (Not Null)
- *Constraints:* UNIQUE(`user_id`, `routine_id`, `completed_date`) to prevent duplicate completions on the same day.
- *Purpose:* Replaces midnight cron resets.

#### B. Weekly Routines
**`weekly_routines`** (Persistent definitions)
- `name`: `text` (Not Null)
- `description`: `text` (Nullable)
- `is_active`: `boolean` (Not Null, Default: true)

**`weekly_routine_completions`** (Historical records)
- `routine_id`: `uuid` (Not Null, Ref: `weekly_routines`, ON DELETE CASCADE)
- `week_start_date`: `date` (Not Null)
- *Constraints:* UNIQUE(`user_id`, `routine_id`, `week_start_date`).

#### C. Daily Outfits
**`daily_outfits`**
- `worn_date`: `date` (Not Null)
- `top`: `text` (Not Null)
- `bottom`: `text` (Not Null)
- `footwear`: `text` (Nullable)
- `notes`: `text` (Nullable)
- *Note:* Daily Outfits supports multiple outfit records per user per date. The original `UNIQUE(user_id, worn_date)` constraint is being removed.
- *Migration Status:* The migration to drop the unique constraint (`004_drop_daily_outfits_unique_constraint.sql`) is **APPLIED**.
- `001_initial_schema.sql` — APPLIED
- `002_add_daily_routine_fields.sql` — APPLIED
- `003_add_weekly_routine_fields.sql` — APPLIED
- `004_drop_daily_outfits_unique_constraint.sql` — APPLIED
- `005_add_credentials_category.sql` — APPLIED
- `006_expand_credentials_categories.sql` — APPLIED

#### D. Wishlist
**`wishlist_items`**
- `name`: `text` (Not Null)
- `estimated_price`: `numeric` (Nullable)
- `priority`: `text` (Nullable, Check: 'Low', 'Medium', 'High')
- `is_purchased`: `boolean` (Default: `false`)
- `purchased_date`: `date` (Nullable)
- `notes`: `text` (Nullable)

#### E. To Give & To Get
**`to_give`**
- `person_name`: `text` (Not Null)
- `amount`: `numeric` (Not Null)
- `reason`: `text` (Nullable)
- `due_date`: `date` (Nullable)
- `status`: `text` (Default: 'Pending', Check: 'Pending', 'Paid')
- `notes`: `text` (Nullable)

**`to_get`**
- `person_name`: `text` (Not Null)
- `amount`: `numeric` (Not Null)
- `reason`: `text` (Nullable)
- `expected_date`: `date` (Nullable)
- `status`: `text` (Default: 'Pending', Check: 'Pending', 'Received')
- `notes`: `text` (Nullable)
*Note:* Kept as two separate tables as requested. This prevents complex conditional queries or confusing UX when rendering "debts" versus "credits".

#### F. Credentials
**`credentials`**
- `app_name`: `text` (Not Null)
- `username_email`: `text` (Not Null)
- `encrypted_password`: `text` (Nullable)
- `category`: `text` (Not Null, Default: 'Personal', Check: 'Professional', 'Personal')
- `notes`: `text` (Nullable)
- *Migration Status:* The migration `005_add_credentials_category.sql` is **APPLIED**.

#### G. Personal Documents
**`personal_documents`**
- `document_name`: `text` (Not Null)
- `category`: `text` (Nullable)
- `file_path`: `text` (Nullable)
- `expiry_date`: `date` (Nullable)
- `notes`: `text` (Nullable)
*Purpose:* Stores only metadata. `file_path` points to a private Supabase Storage bucket.
*Proposed Categories:* 'Identity & Government', 'Education', 'Professional & Employment', 'Banking & Finance', 'Health & Insurance', 'Vehicle', 'Property', 'Travel', 'Bills & Receipts', 'Certificates', 'Other'
*Migration Status:* 
- `007_add_document_categories.sql` (adds category CHECK constraint) is **APPLIED**.
- `008_add_user_documents_storage_policies.sql` (adds Storage RLS policies) is **APPLIED**.

#### H. Annual Trips
**`annual_trips`**
- `trip_name`: `text` (Not Null)
- `destination`: `text` (Not Null)
- `start_date`: `date` (Not Null)
- `end_date`: `date` (Nullable)
- `category`: `text` (Not Null, Default: 'Other')
- `fuel_cost`: `numeric` (Default: 0)
- `food_cost`: `numeric` (Default: 0)
- `stay_cost`: `numeric` (Default: 0)
- `other_cost`: `numeric` (Default: 0)
- `notes`: `text` (Nullable)

*Migration Status:*
- `009_add_annual_trips_category.sql` (adds category column and CHECK constraint) is **APPLIED**.

*Category Constraint:* 'Vacation', 'Family & Personal', 'Professional & Work', 'Weekend Getaway', 'Pilgrimage & Spiritual', 'Education & Study', 'Special Event', 'Other'. Default is 'Other' to protect existing data without assuming intent.

*Derived Client-Side Architecture Rules:*
- **Status:** Derived dynamically from dates. UPCOMING (`start_date > today`), ONGOING (`start_date <= today AND effective_end_date >= today`), COMPLETED (`effective_end_date < today`).
- **Year:** Derived from `start_date`. No database column used.
- **Duration:** Calculated inclusively. If `end_date` is `NULL`, `effective_end_date = start_date`, resulting in a 1-day trip duration.
- **Total Cost:** Derived sum of the four expense columns (`fuel_cost + food_cost + stay_cost + other_cost`). Storing it directly risks data desynchronization if an individual expense is updated.

#### I. Important Notes
**`important_notes`**
- `heading`: `text` (Not Null)
- `content`: `text` (Not Null)
*Migration Status:*
- `017_add_important_notes.sql` is **APPLIED**.
*Purpose:* A deliberately minimal notebook for storing persistent personal reference information. No categories, tagging, or complex formatting.

### 2.2 Daily Chores (REMOVED)
*Status:* Both **Vehicles** and **Important Items** features were permanently dropped from the LifeOS roadmap. Their historical schema design (Migrations 010 and 011) was fully reverted via `015_remove_vehicles_important_items.sql`.
*Migration Status:* `015_remove_vehicles_important_items.sql` is **PREPARED / NOT APPLIED**.

### 2.3 Professional

#### A. Meetings
**`meetings`**
- `title`: `text` (Not Null)
- `meeting_type`: `text` (Not Null, Default 'Other', Check: 'Client', 'Internal', 'Interview', 'Networking', 'Personal', 'Other')
- `status`: `text` (Not Null, Default 'Upcoming', Check: 'Upcoming', 'Completed', 'Cancelled')
- `meeting_link`: `text` (Nullable)
- `meeting_date`: `timestamptz` (Not Null)
- `summary`: `text` (Nullable)
- `notes`: `text` (Nullable)
- `bullet_points`: `jsonb` (Nullable)
- `checklist`: `jsonb` (Nullable)

*Migration Status:*
- `012_expand_meetings.sql` is **APPLIED**.
- `013_remove_meetings.sql` is **APPLIED**.

*Derived Architecture & Scope Rules:*
- **Feature Removed:** The entire Meetings feature was intentionally removed from LifeOS scope. The `public.meetings` table is permanently dropped in migration 013.

#### B. Daily Notes
**`daily_notes`**
- `note_date`: `date` (Not Null)
- `title`: `text` (Nullable)
- `work_completed`: `text` (Nullable)
- `pending_work`: `text` (Nullable)

*Migration Status:*
- **No migration required.** Daily Notes relies entirely on the original `001_initial_schema.sql` design.
- Migration `014` remains UNUSED and AVAILABLE.

*Derived Architecture & Scope Rules:*
- **Strict Daily Limit:** The database enforces `UNIQUE(user_id, note_date)`. The frontend prevents duplicate UI submissions by intercepting duplicate dates and gracefully routing the user into an Edit flow instead.
- **Structured Journaling:** No generic generic text dump or Markdown. It strictly relies on separating "Work Completed" and "Pending Work".

#### C. Attendance & Reminders
**`attendance_records`**
- `record_date`: `date` (Not Null)
- `is_submitted`: `boolean` (Not Null, Default: false)
- `status`: `text` (Not Null, Default: 'Present')
- `remarks`: `text` (Nullable)
- *Constraints:* UNIQUE(`user_id`, `record_date`).

**`reminders`**
- `reminder_date`: `date` (Not Null)
- `title`: `text` (Not Null)
- `reminder_time`: `time` (Nullable)
- `notes`: `text` (Nullable)
- `is_completed`: `boolean` (Not Null, Default: false)
- *Constraints:* No UNIQUE constraint on date; multiple reminders allowed per day.

*Migration Status:*
- `014_add_attendance_status.sql` is **APPLIED**.
- `016_add_reminders.sql` is **APPLIED**.

*Derived Architecture & Scope Rules:*
- **Legacy Boolean Preservation:** The `is_submitted` field remains in the database entirely untouched for backward compatibility, but Phase 9B React UI will intentionally ignore it completely.
- **Combined Interface:** Reminders share the calendar UI natively with Attendance. They are visually secondary.
- **Independence:** Reminders do not require an attendance record to exist on the same date. They are completely decoupled tables.

### 2.4 Finance

#### A. Expense Tracker
**`expenses`**
- `title`: `text` (Not Null)
- `amount`: `numeric` (Not Null, Check: `amount > 0`)
- `expense_date`: `date` (Not Null)
- `category`: `text` (Not Null, Check: 'Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other')
- `description`: `text` (Nullable)

*Migration Status:*
- `018_create_expenses.sql` is **APPLIED**.

## 3. Relationships & Avoided Tables

- **Supabase Auth Ownership:** Every single table relies on an implicit or explicit relationship to `auth.users()` via the `user_id` column.
- **Routines -> Completions:** There are exactly TWO intentional feature-to-feature relationships:
  - `daily_routine_completions.routine_id` -> `daily_routines.id` (ON DELETE CASCADE)
  - `weekly_routine_completions.routine_id` -> `weekly_routines.id` (ON DELETE CASCADE)
  These are necessary to map completion records to the persistent routine definitions securely. If a routine is deleted, its historical completions are automatically removed to prevent orphaned records. No other feature-to-feature relationships exist.
- **Tables Intentionally Avoided:** 
  - `meeting_bullets` / `meeting_checklists` (replaced by simple `jsonb`).
  - `wardrobe_items` (replaced by simple `text` fields in `daily_outfits`).
  - `vehicle_maintenance_history` (avoided per requirements, updating `last_service_date` directly on the `vehicles` table is simpler).
  - Custom `users` profile table (auth metadata is sufficient for now).

## 4. Routine Completion Architecture

1. The `daily_routines` table stores the template ("Lip Drills", "Read English Book").
2. The UI fetches routines for the logged-in user.
3. The UI fetches records from `daily_routine_completions` where `completed_date = CURRENT_LOCAL_DATE`.
4. If a routine's ID exists in the completions array, it renders as checked.
5. Checking a box INSERTS a row. Unchecking DELETES the row.
6. This architecture entirely eliminates the need for complex server-side cron jobs resetting database columns at midnight, while perfectly preserving historical completion data.

## 5. Storage Architecture

**Private Bucket:** `user-documents` (CREATED / PRIVATE / 1 MB PER FILE)
- **Configuration:**
  - **Public:** OFF (Private)
  - **Max File Size:** 1 MB
  - **Allowed MIME types:** `application/pdf`, `image/jpeg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Structure:**
  - `/{user_id}/{uuid}-{sanitized_filename}` (e.g. `123-uuid/550e-uuid-passport.pdf`)
- **Security:** RLS Policy on the bucket ensures a user can only upload, read, update, and delete files inside a folder exactly matching their `auth.uid()`. Access to files is granted via short-lived signed URLs (e.g., 60 seconds).

## 6. RLS Strategy (Row Level Security)

Every table will have RLS ENABLED. 
The standard policy pattern for EVERY table will be:
- **Select:** `(auth.uid() = user_id)`
- **Insert:** `(auth.uid() = user_id)` (Ensure WITH CHECK verifies this)
- **Update:** `(auth.uid() = user_id)` (Protect both record visibility and resulting ownership)
- **Delete:** `(auth.uid() = user_id)`

No data is public. No one can interact with records missing their `user_id`.

## 7. Credential/Password Security Recommendation

> [!CAUTION]
> **Storing plain text passwords in the `credentials` table is fundamentally insecure.**

1. **What happens if stored plainly:** Any developer, database admin, or malicious actor who gains access to the database (or a backup) can read your passwords in plain text.
2. **What RLS protects:** RLS prevents *other authenticated users* from querying your passwords via the API.
3. **What RLS does NOT protect:** RLS does not protect against direct database access, leaked service-role keys, or database dumps.
4. **Is it advisable?** No. 
5. **Resolution:** We have explicitly dropped plain-text password storage. The schema uses `encrypted_password` (Nullable). Phase 4B will NOT implement credential insertion or logic. This feature is deferred until a formal encryption architecture is separately approved in the future.

## 8. Index Recommendations
To keep queries fast as historical records grow:
- Index on `user_id` for all tables.
- Compound Index on `(user_id, completed_date)` for `daily_routine_completions`.
- Compound Index on `(user_id, week_start_date)` for `weekly_routine_completions`.
- Index on `(user_id, note_date)` for `daily_notes`.

## 9. Initial Seed-Data Strategy

Initial records (like "Lip Drills", "Bike 1", etc.) will NOT use a temporary React script or button. They will be inserted later using a controlled authenticated/manual initialization process, ensuring they correctly belong to the authenticated user.

## 10. CRUD Compatibility
Every single table listed above is perfectly compatible with standard `INSERT`, `SELECT`, `UPDATE`, `DELETE` operations via the Supabase Javascript Client without requiring complex server-side edge functions.
