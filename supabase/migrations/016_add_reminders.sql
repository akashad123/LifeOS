-- Migration 016: Add Reminders
-- Description: Creates the reminders table to be used alongside Attendance in the calendar.

CREATE TABLE reminders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    reminder_date date not null,
    title text not null,
    reminder_time time,
    notes text,
    is_completed boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS Policies
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own reminders" ON reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own reminders" ON reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own reminders" ON reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own reminders" ON reminders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_reminders_user_date ON reminders(user_id, reminder_date);

-- Triggers
CREATE TRIGGER update_reminders_updated_at 
BEFORE UPDATE ON reminders 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
