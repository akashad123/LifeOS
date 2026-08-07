import { supabase } from '../lib/supabaseClient';

export async function getDailyNotes() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_notes')
    .select('*')
    .order('note_date', { ascending: false });

  if (error) throw new Error(`Error fetching daily notes: ${error.message}`);
  return data || [];
}

export async function createDailyNote(noteData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_notes')
    .insert([{ ...noteData, user_id: userData.user.id }])
    .select()
    .single();

  if (error) throw new Error(`Error creating daily note: ${error.message}`);
  return data;
}

export async function updateDailyNote(id, noteData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_notes')
    .update(noteData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating daily note: ${error.message}`);
  return data;
}

export async function deleteDailyNote(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('daily_notes')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting daily note: ${error.message}`);
  return true;
}
