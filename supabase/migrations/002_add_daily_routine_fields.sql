-- Migration 002: Add missing fields to daily_routines
-- Reason: Phase 5A React implementation requires description and is_active

ALTER TABLE public.daily_routines
ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.daily_routines
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
