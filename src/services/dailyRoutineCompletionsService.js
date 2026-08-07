import { supabase } from '../lib/supabaseClient';

export async function getDailyRoutineCompletions(date) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('daily_routine_completions')
    .select('routine_id')
    .eq('completed_date', date);

  if (error) throw new Error(`Error fetching completions: ${error.message}`);
  return data.map(row => row.routine_id);
}

export async function markDailyRoutineComplete(routineId, date) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('daily_routine_completions')
    .insert([
      { routine_id: routineId, completed_date: date, user_id: userData.user.id }
    ]);

  if (error) {
    if (error.code === '23505') { 
      return; 
    }
    throw new Error(`Error marking complete: ${error.message}`);
  }
}

export async function markDailyRoutineIncomplete(routineId, date) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('daily_routine_completions')
    .delete()
    .match({ routine_id: routineId, completed_date: date, user_id: userData.user.id });
    
  if (error) throw new Error(`Error marking incomplete: ${error.message}`);
}
