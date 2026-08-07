import { supabase } from '../lib/supabaseClient';

export async function getTrips() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('annual_trips')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw new Error(`Error fetching trips: ${error.message}`);
  return data || [];
}

export async function createTrip(tripData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('annual_trips')
    .insert([
      { ...tripData, user_id: userData.user.id }
    ])
    .select()
    .single();

  if (error) throw new Error(`Error creating trip: ${error.message}`);
  return data;
}

export async function updateTrip(id, tripData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('annual_trips')
    .update(tripData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating trip: ${error.message}`);
  return data;
}

export async function deleteTrip(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('annual_trips')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting trip: ${error.message}`);
  return true;
}
