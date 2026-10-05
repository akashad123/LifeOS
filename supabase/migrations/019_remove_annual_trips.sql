-- Migration 019: Remove Annual Trips
-- Description: Permanently removes the annual_trips table from LifeOS.

DROP TABLE IF EXISTS public.annual_trips CASCADE;
