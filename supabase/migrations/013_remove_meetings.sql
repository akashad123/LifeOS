-- Migration 013: Remove Meetings
-- Description: Completely drops the public.meetings table from LifeOS.

DROP TABLE IF EXISTS public.meetings;
