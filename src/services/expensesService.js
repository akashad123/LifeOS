import { supabase } from '../lib/supabaseClient';

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching expenses: ${error.message}`);
  return data;
}

export async function createExpense(expenseData) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error('User not authenticated');

  const payload = {
    ...expenseData,
    user_id: authData.user.id
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(`Error creating expense: ${error.message}`);
  return data;
}

export async function updateExpense(id, expenseData) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('expenses')
    .update(expenseData)
    .eq('id', id)
    .eq('user_id', authData.user.id)
    .select()
    .single();

  if (error) throw new Error(`Error updating expense: ${error.message}`);
  return data;
}

export async function deleteExpense(id) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) throw new Error(`Error deleting expense: ${error.message}`);
  return true;
}
