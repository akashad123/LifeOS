import { supabase } from '../lib/supabaseClient';

export async function getWishlistItems() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching wishlist items: ${error.message}`);
  return data;
}

export async function createWishlistItem(itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert([
      { ...itemData, user_id: userData.user.id }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error creating wishlist item: ${error.message}`);
  return data;
}

export async function updateWishlistItem(id, itemData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('wishlist_items')
    .update(itemData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating wishlist item: ${error.message}`);
  return data;
}

export async function deleteWishlistItem(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting wishlist item: ${error.message}`);
  return true;
}
