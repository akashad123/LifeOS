import { supabase } from '../lib/supabaseClient';

export async function getAttendanceRecords() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .order('record_date', { ascending: true }); // Keep ascending for calendar ease

  if (error) throw new Error(`Error fetching attendance records: ${error.message}`);
  return data || [];
}

export async function createAttendanceRecord(recordData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('attendance_records')
    .insert([{ ...recordData, user_id: userData.user.id }])
    .select()
    .single();

  if (error) throw new Error(`Error creating attendance record: ${error.message}`);
  return data;
}

export async function updateAttendanceRecord(id, recordData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('attendance_records')
    .update(recordData)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating attendance record: ${error.message}`);
  return data;
}

export async function deleteAttendanceRecord(id) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .match({ id, user_id: userData.user.id });

  if (error) throw new Error(`Error deleting attendance record: ${error.message}`);
  return true;
}
