import { supabase } from '../lib/supabaseClient';

export async function getDailyOutfitsByDate(date) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_outfits')
    .select('*')
    .eq('worn_date', date)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching outfits: ${error.message}`);
  }

  return data;
}

export async function createDailyOutfit(outfitData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_outfits')
    .insert([
      { ...outfitData, user_id: userData.user.id }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error creating outfit: ${error.message}`);
  return data;
}

export async function updateDailyOutfit(id, outfitData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_outfits')
    .update(outfitData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating outfit: ${error.message}`);
  return data;
}

export async function getDailyOutfitSuggestions() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_outfits')
    .select('top, bottom, footwear')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching outfit suggestions: ${error.message}`);
  }

  return data || [];
}

export async function deleteDailyOutfit(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('daily_outfits')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting outfit: ${error.message}`);
  return true;
}
