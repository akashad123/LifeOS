-- Migration: Expand Credentials Categories
-- Description: Drops existing credentials_category_check and creates a new one with extended categories.

ALTER TABLE public.credentials
DROP CONSTRAINT credentials_category_check;

ALTER TABLE public.credentials
ADD CONSTRAINT credentials_category_check
CHECK (category IN (
  'Personal',
  'Professional',
  'Study / Education',
  'Banking & Finance',
  'Railway & Travel',
  'Government',
  'Shopping',
  'Social Media',
  'Entertainment',
  'Gaming',
  'Cloud & Hosting',
  'Development',
  'Work Tools',
  'IT & Devices',
  'Communication',
  'Email',
  'Parents / Family',
  'Health & Insurance',
  'Utilities & Bills',
  'Other'
));
