CREATE TABLE expenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    amount numeric not null check (amount > 0),
    expense_date date not null,
    category text not null check (
        category in (
            'Food',
            'Travel',
            'Shopping',
            'Bills',
            'Health',
            'Entertainment',
            'Education',
            'Other'
        )
    ),
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Select own expenses" ON expenses 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Insert own expenses" ON expenses 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own expenses" ON expenses 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own expenses" ON expenses 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);

-- Trigger
CREATE TRIGGER update_expenses_updated_at 
BEFORE UPDATE ON expenses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
