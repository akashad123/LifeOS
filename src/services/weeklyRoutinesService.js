import { supabase } from '../lib/supabaseClient';

export async function getWeeklyRoutines() {
  const { data, error } = await supabase
    .from('weekly_routines')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching weekly routines: ${error.message}`);
  }
  return data;
}

export async function createWeeklyRoutine(routineData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error(`Auth error: ${userError?.message || 'User not found'}`);
  }
  
  const { data, error } = await supabase
    .from('weekly_routines')
    .insert([{ ...routineData, user_id: userData.user.id }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating weekly routine: ${error.message}`);
  }
  return data;
}

export async function updateWeeklyRoutine(id, updates) {
  const { data, error } = await supabase
    .from('weekly_routines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating weekly routine: ${error.message}`);
  }
  return data;
}

export async function deleteWeeklyRoutine(id) {
  const { error } = await supabase
    .from('weekly_routines')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting weekly routine: ${error.message}`);
  }
}
