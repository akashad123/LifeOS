-- Migration: Add Category to Credentials
-- Description: Categorizes credentials as either Professional or Personal. Existing rows default to Personal.

ALTER TABLE public.credentials
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Personal';

ALTER TABLE public.credentials
ADD CONSTRAINT credentials_category_check
CHECK (category IN ('Professional', 'Personal'));
