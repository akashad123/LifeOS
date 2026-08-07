import { supabase } from '../lib/supabaseClient';

export async function getToGiveItems() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('to_give')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching items: ${error.message}`);
  return data;
}

export async function createToGiveItem(itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('to_give')
    .insert([
      { ...itemData, user_id: userData.user.id }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error creating item: ${error.message}`);
  return data;
}

export async function updateToGiveItem(id, itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('to_give')
    .update(itemData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating item: ${error.message}`);
  return data;
}

export async function deleteToGiveItem(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('to_give')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting item: ${error.message}`);
  return true;
}
