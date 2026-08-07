import { supabase } from '../lib/supabaseClient';

export async function getDailyRoutines() {
  const { data, error } = await supabase
    .from('daily_routines')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching daily routines: ${error.message}`);
  }
  return data;
}

export async function createDailyRoutine(routineData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error(`Auth error: ${userError?.message || 'User not found'}`);
  }
  
  const { data, error } = await supabase
    .from('daily_routines')
    .insert([{ ...routineData, user_id: userData.user.id }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating daily routine: ${error.message}`);
  }
  return data;
}

export async function updateDailyRoutine(id, updates) {
  const { data, error } = await supabase
    .from('daily_routines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating daily routine: ${error.message}`);
  }
  return data;
}

export async function deleteDailyRoutine(id) {
  const { error } = await supabase
    .from('daily_routines')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting daily routine: ${error.message}`);
  }
}
