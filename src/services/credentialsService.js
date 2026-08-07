import { supabase } from '../lib/supabaseClient';

export async function getCredentials() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching credentials: ${error.message}`);
  return data || [];
}

export async function createCredential(itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('credentials')
    .insert([
      { ...itemData, user_id: userData.user.id }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error creating credential: ${error.message}`);
  return data;
}

export async function updateCredential(id, itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('credentials')
    .update(itemData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating credential: ${error.message}`);
  return data;
}

export async function deleteCredential(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('credentials')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting credential: ${error.message}`);
  return true;
}
