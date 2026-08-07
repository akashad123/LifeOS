-- Migration 014: Add Attendance Status
-- Description: Adds a status field to attendance_records for personal tracking without removing the legacy is_submitted boolean.

ALTER TABLE public.attendance_records
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Present';

ALTER TABLE public.attendance_records
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

ALTER TABLE public.attendance_records
ADD CONSTRAINT attendance_records_status_check
CHECK (
  status IN (
    'Present',
    'Absent',
    'Leave',
    'Holiday',
    'Half Day',
    'Work From Home'
  )
);
