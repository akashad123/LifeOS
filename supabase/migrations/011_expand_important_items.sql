-- Migration 011: Expand Important Items
-- Description: Adds category grouping and storage location tracking to important items.

-- 1. Add 'category' with a default to safely populate existing records without breaking constraints.
ALTER TABLE public.important_items 
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Other';

-- 2. Defensively drop the new check constraint if it somehow already exists.
ALTER TABLE public.important_items 
DROP CONSTRAINT IF EXISTS important_items_category_check;

-- 3. Apply the explicit CHECK constraint to the new category column.
ALTER TABLE public.important_items 
ADD CONSTRAINT important_items_category_check 
CHECK (category IN ('Electronics', 'Documents', 'Keys & Access', 'Valuables', 'Home & Appliances', 'Personal', 'Other'));

-- 4. Add the nullable storage_location column (intentionally free-text without unique/check constraints).
ALTER TABLE public.important_items 
ADD COLUMN IF NOT EXISTS storage_location text;
