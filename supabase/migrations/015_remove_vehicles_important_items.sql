-- Migration 015: Remove Vehicles and Important Items
-- Description: Permanently removes the unused vehicles and important_items tables.

DROP TABLE IF EXISTS public.vehicles;
DROP TABLE IF EXISTS public.important_items;
