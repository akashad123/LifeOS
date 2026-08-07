-- Migration 010: Expand Vehicles Schema
-- Description: Adds new optional fields for tracking vehicle dates/milestones and safely updates the vehicle type constraint to support more categories.

-- 1. Add the four new nullable columns
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS registration_number text;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS insurance_expiry_date date;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS puc_expiry_date date;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS service_due_date date;

-- 2. Safely remove the old unnamed CHECK constraint on the `type` column
-- It specifically looks for a check constraint bound to the 'type' column containing the old allowed values.
DO $$ 
DECLARE
  constraint_name text;
BEGIN
  SELECT con.conname INTO constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  JOIN pg_attribute attr ON attr.attrelid = rel.oid AND attr.attnum = ANY(con.conkey)
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'vehicles'
    AND con.contype = 'c'
    AND attr.attname = 'type'
    AND pg_get_constraintdef(con.oid) ILIKE '%Bike%'
    AND pg_get_constraintdef(con.oid) ILIKE '%Car%'
    AND pg_get_constraintdef(con.oid) ILIKE '%Other%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.vehicles DROP CONSTRAINT ' || quote_ident(constraint_name);
  END IF;
END $$;

-- 3. Safely migrate existing 'Bike' data to 'Motorcycle' before applying the new constraint
UPDATE public.vehicles
SET type = 'Motorcycle'
WHERE type = 'Bike';

-- 4. Apply the new explicitly named CHECK constraint defensively
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_type_check;
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_type_check 
CHECK (type IN ('Car', 'Motorcycle', 'Scooter', 'Bicycle', 'Other'));
