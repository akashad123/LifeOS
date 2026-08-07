-- 1. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Create Tables

-- 1. daily_routines
CREATE TABLE daily_routines (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. daily_routine_completions
CREATE TABLE daily_routine_completions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    routine_id uuid not null references daily_routines(id) on delete cascade,
    completed_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    UNIQUE(user_id, routine_id, completed_date)
);

-- 3. weekly_routines
CREATE TABLE weekly_routines (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. weekly_routine_completions
CREATE TABLE weekly_routine_completions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    routine_id uuid not null references weekly_routines(id) on delete cascade,
    week_start_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    UNIQUE(user_id, routine_id, week_start_date)
);

-- 5. daily_outfits
CREATE TABLE daily_outfits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    worn_date date not null,
    top text not null,
    bottom text not null,
    footwear text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    UNIQUE(user_id, worn_date)
);

-- 6. wishlist_items
CREATE TABLE wishlist_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    estimated_price numeric check (estimated_price >= 0),
    priority text check (priority in ('Low', 'Medium', 'High')),
    is_purchased boolean not null default false,
    purchased_date date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 7. to_give
CREATE TABLE to_give (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    person_name text not null,
    amount numeric not null check (amount >= 0),
    reason text,
    due_date date,
    status text not null default 'Pending' check (status in ('Pending', 'Paid')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 8. to_get
CREATE TABLE to_get (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    person_name text not null,
    amount numeric not null check (amount >= 0),
    reason text,
    expected_date date,
    status text not null default 'Pending' check (status in ('Pending', 'Received')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 9. credentials
CREATE TABLE credentials (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    app_name text not null,
    username_email text not null,
    encrypted_password text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 10. personal_documents
CREATE TABLE personal_documents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    document_name text not null,
    category text,
    file_path text,
    expiry_date date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 11. annual_trips
CREATE TABLE annual_trips (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    trip_name text not null,
    destination text not null,
    start_date date not null,
    end_date date,
    fuel_cost numeric not null default 0 check (fuel_cost >= 0),
    food_cost numeric not null default 0 check (food_cost >= 0),
    stay_cost numeric not null default 0 check (stay_cost >= 0),
    other_cost numeric not null default 0 check (other_cost >= 0),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 12. vehicles
CREATE TABLE vehicles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    type text not null check (type in ('Bike', 'Car', 'Other')),
    last_service_date date,
    last_nitrogen_fill_date date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 13. important_items
CREATE TABLE important_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    item_name text not null,
    purchase_date date,
    purchase_price numeric check (purchase_price >= 0),
    bill_file_path text,
    warranty_file_path text,
    warranty_expiry_date date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 14. meetings
CREATE TABLE meetings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    meeting_date timestamptz not null,
    summary text,
    notes text,
    bullet_points jsonb default '[]'::jsonb,
    checklist jsonb default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 15. daily_notes
CREATE TABLE daily_notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    note_date date not null,
    title text,
    work_completed text,
    pending_work text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    UNIQUE(user_id, note_date)
);

-- 16. attendance_records
CREATE TABLE attendance_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    record_date date not null,
    is_submitted boolean not null default false,
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    UNIQUE(user_id, record_date)
);

-- 3. Triggers for updated_at
CREATE TRIGGER update_daily_routines_updated_at BEFORE UPDATE ON daily_routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_routine_completions_updated_at BEFORE UPDATE ON daily_routine_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_routines_updated_at BEFORE UPDATE ON weekly_routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_routine_completions_updated_at BEFORE UPDATE ON weekly_routine_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_outfits_updated_at BEFORE UPDATE ON daily_outfits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_to_give_updated_at BEFORE UPDATE ON to_give FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_to_get_updated_at BEFORE UPDATE ON to_get FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_documents_updated_at BEFORE UPDATE ON personal_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annual_trips_updated_at BEFORE UPDATE ON annual_trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_important_items_updated_at BEFORE UPDATE ON important_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_notes_updated_at BEFORE UPDATE ON daily_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE to_give ENABLE ROW LEVEL SECURITY;
ALTER TABLE to_get ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- daily_routines
CREATE POLICY "Select own daily_routines" ON daily_routines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own daily_routines" ON daily_routines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own daily_routines" ON daily_routines FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own daily_routines" ON daily_routines FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- daily_routine_completions (with cross-user protection on routine_id)
CREATE POLICY "Select own daily_routine_completions" ON daily_routine_completions FOR SELECT TO authenticated USING (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM daily_routines WHERE daily_routines.id = daily_routine_completions.routine_id AND daily_routines.user_id = auth.uid())
);
CREATE POLICY "Delete own daily_routine_completions" ON daily_routine_completions FOR DELETE TO authenticated USING (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM daily_routines WHERE daily_routines.id = daily_routine_completions.routine_id AND daily_routines.user_id = auth.uid())
);
CREATE POLICY "Insert own daily_routine_completions" ON daily_routine_completions FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM daily_routines WHERE daily_routines.id = daily_routine_completions.routine_id AND daily_routines.user_id = auth.uid())
);
CREATE POLICY "Update own daily_routine_completions" ON daily_routine_completions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM daily_routines WHERE daily_routines.id = daily_routine_completions.routine_id AND daily_routines.user_id = auth.uid())
);

-- weekly_routines
CREATE POLICY "Select own weekly_routines" ON weekly_routines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own weekly_routines" ON weekly_routines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own weekly_routines" ON weekly_routines FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own weekly_routines" ON weekly_routines FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- weekly_routine_completions (with cross-user protection on routine_id)
CREATE POLICY "Select own weekly_routine_completions" ON weekly_routine_completions FOR SELECT TO authenticated USING (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM weekly_routines WHERE weekly_routines.id = weekly_routine_completions.routine_id AND weekly_routines.user_id = auth.uid())
);
CREATE POLICY "Delete own weekly_routine_completions" ON weekly_routine_completions FOR DELETE TO authenticated USING (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM weekly_routines WHERE weekly_routines.id = weekly_routine_completions.routine_id AND weekly_routines.user_id = auth.uid())
);
CREATE POLICY "Insert own weekly_routine_completions" ON weekly_routine_completions FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM weekly_routines WHERE weekly_routines.id = weekly_routine_completions.routine_id AND weekly_routines.user_id = auth.uid())
);
CREATE POLICY "Update own weekly_routine_completions" ON weekly_routine_completions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM weekly_routines WHERE weekly_routines.id = weekly_routine_completions.routine_id AND weekly_routines.user_id = auth.uid())
);

-- daily_outfits
CREATE POLICY "Select own daily_outfits" ON daily_outfits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own daily_outfits" ON daily_outfits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own daily_outfits" ON daily_outfits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own daily_outfits" ON daily_outfits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- wishlist_items
CREATE POLICY "Select own wishlist_items" ON wishlist_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own wishlist_items" ON wishlist_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own wishlist_items" ON wishlist_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own wishlist_items" ON wishlist_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- to_give
CREATE POLICY "Select own to_give" ON to_give FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own to_give" ON to_give FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own to_give" ON to_give FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own to_give" ON to_give FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- to_get
CREATE POLICY "Select own to_get" ON to_get FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own to_get" ON to_get FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own to_get" ON to_get FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own to_get" ON to_get FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- credentials
CREATE POLICY "Select own credentials" ON credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own credentials" ON credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own credentials" ON credentials FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own credentials" ON credentials FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- personal_documents
CREATE POLICY "Select own personal_documents" ON personal_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own personal_documents" ON personal_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own personal_documents" ON personal_documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own personal_documents" ON personal_documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- annual_trips
CREATE POLICY "Select own annual_trips" ON annual_trips FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own annual_trips" ON annual_trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own annual_trips" ON annual_trips FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own annual_trips" ON annual_trips FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- vehicles
CREATE POLICY "Select own vehicles" ON vehicles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own vehicles" ON vehicles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own vehicles" ON vehicles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own vehicles" ON vehicles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- important_items
CREATE POLICY "Select own important_items" ON important_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own important_items" ON important_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own important_items" ON important_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own important_items" ON important_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- meetings
CREATE POLICY "Select own meetings" ON meetings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own meetings" ON meetings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own meetings" ON meetings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own meetings" ON meetings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- daily_notes
CREATE POLICY "Select own daily_notes" ON daily_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own daily_notes" ON daily_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own daily_notes" ON daily_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own daily_notes" ON daily_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- attendance_records
CREATE POLICY "Select own attendance_records" ON attendance_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Insert own attendance_records" ON attendance_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own attendance_records" ON attendance_records FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own attendance_records" ON attendance_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Indexes for common querying
CREATE INDEX idx_daily_routines_user_id ON daily_routines(user_id);
CREATE INDEX idx_daily_routine_completions_user_date ON daily_routine_completions(user_id, completed_date);
CREATE INDEX idx_weekly_routines_user_id ON weekly_routines(user_id);
CREATE INDEX idx_weekly_routine_completions_user_week ON weekly_routine_completions(user_id, week_start_date);
CREATE INDEX idx_daily_notes_user_date ON daily_notes(user_id, note_date);
CREATE INDEX idx_attendance_records_user_date ON attendance_records(user_id, record_date);
CREATE INDEX idx_meetings_user_date ON meetings(user_id, meeting_date);
