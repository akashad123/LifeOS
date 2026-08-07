-- Migration 017: Add Important Notes
-- Description: Creates a simple table for persistent personal reference notes.

CREATE TABLE important_notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    heading text not null,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS Policies
ALTER TABLE important_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own important notes" ON important_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own important notes" ON important_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own important notes" ON important_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own important notes" ON important_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_important_notes_updated_at 
BEFORE UPDATE ON important_notes 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
