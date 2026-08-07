-- Migration 012: Expand Meetings
-- Description: Adds meeting types, semantic statuses, and optional links.

-- 1. Defensively drop the new check constraints if they somehow already exist.
ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS meetings_type_check;
ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS meetings_status_check;

-- 2. Add 'meeting_type' with a default to safely populate existing records.
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS meeting_type text NOT NULL DEFAULT 'Other';

-- 3. Apply the explicit CHECK constraint to the meeting_type column.
ALTER TABLE public.meetings ADD CONSTRAINT meetings_type_check CHECK (meeting_type IN ('Client', 'Internal', 'Interview', 'Networking', 'Personal', 'Other'));

-- 4. Add 'status' with a default to safely populate existing records.
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Upcoming';

-- 5. Apply the explicit CHECK constraint to the status column.
ALTER TABLE public.meetings ADD CONSTRAINT meetings_status_check CHECK (status IN ('Upcoming', 'Completed', 'Cancelled'));

-- 6. Add the nullable meeting_link column (intentionally free-text without unique/check constraints).
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS meeting_link text;
