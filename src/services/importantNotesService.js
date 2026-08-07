import { supabase } from '../lib/supabaseClient';

export async function getImportantNotes() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('important_notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`Error fetching important notes: ${error.message}`);
  return data || [];
}

export async function createImportantNote(noteData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('important_notes')
    .insert([{ ...noteData, user_id: userData.user.id }])
    .select()
    .single();

  if (error) throw new Error(`Error creating important note: ${error.message}`);
  return data;
}

export async function updateImportantNote(id, noteData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('important_notes')
    .update(noteData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating important note: ${error.message}`);
  return data;
}

export async function deleteImportantNote(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('important_notes')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting important note: ${error.message}`);
  return true;
}
