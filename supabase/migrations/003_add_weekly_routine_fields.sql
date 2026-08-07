-- Migration 003: Add missing fields to weekly_routines
-- Reason: Phase 6A React implementation requires description and is_active

ALTER TABLE public.weekly_routines
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.weekly_routines
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
