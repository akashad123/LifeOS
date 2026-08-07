import { supabase } from '../lib/supabaseClient';

export async function getReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .order('reminder_date', { ascending: true })
    .order('reminder_time', { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Error fetching reminders: ${error.message}`);
  return data;
}

export async function createReminder(reminderData) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error('User not authenticated');

  const payload = {
    ...reminderData,
    user_id: authData.user.id
  };

  const { data, error } = await supabase
    .from('reminders')
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(`Error creating reminder: ${error.message}`);
  return data;
}

export async function updateReminder(id, reminderData) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reminders')
    .update(reminderData)
    .eq('id', id)
    .eq('user_id', authData.user.id)
    .select()
    .single();

  if (error) throw new Error(`Error updating reminder: ${error.message}`);
  return data;
}

export async function deleteReminder(id) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) throw new Error(`Error deleting reminder: ${error.message}`);
  return true;
}
