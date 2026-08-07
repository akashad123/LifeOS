import { supabase } from '../lib/supabaseClient';

export async function getToGetItems() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('to_get')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching items: ${error.message}`);
  return data || [];
}

export async function createToGetItem(itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('to_get')
    .insert([
      { ...itemData, user_id: userData.user.id }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error creating item: ${error.message}`);
  return data;
}

export async function updateToGetItem(id, itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('to_get')
    .update(itemData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating item: ${error.message}`);
  return data;
}

export async function deleteToGetItem(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('to_get')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting item: ${error.message}`);
  return true;
}
