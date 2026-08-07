-- Migration: Add Category to Annual Trips
-- Description: Adds a mandatory category column with a default of 'Other' and enforces a fixed list of allowed categories via a CHECK constraint.

-- 1. Add the category column (defaulting to 'Other' to protect existing data without assuming it's a Vacation)
ALTER TABLE public.annual_trips
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Other';

-- 2. Add the constraint to ensure only valid categories are inserted/updated
ALTER TABLE public.annual_trips
ADD CONSTRAINT annual_trips_category_check
CHECK (
  category IN (
    'Vacation',
    'Family & Personal',
    'Professional & Work',
    'Weekend Getaway',
    'Pilgrimage & Spiritual',
    'Education & Study',
    'Special Event',
    'Other'
  )
);
