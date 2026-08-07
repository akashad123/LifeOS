import { supabase } from '../lib/supabaseClient';

export async function getDocuments() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('personal_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error fetching documents: ${error.message}`);
  return data || [];
}

export async function createDocument(metadata, file) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const userId = userData.user.id;

  // 1. Sanitize filename and construct path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const uniqueId = crypto.randomUUID();
  const filePath = `${userId}/${uniqueId}-${sanitizedName}`;

  // 2. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('user-documents')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Error uploading file: ${uploadError.message}`);
  }

  // 3. Insert metadata into database
  const { data, error: dbError } = await supabase
    .from('personal_documents')
    .insert([
      { ...metadata, file_path: filePath, user_id: userId }
    ])
    .select()
    .single();

  // 4. Rollback Storage if DB insert fails
  if (dbError) {
    await supabase.storage.from('user-documents').remove([filePath]);
    throw new Error(`Error saving document metadata: ${dbError.message}`);
  }

  return data;
}

export async function updateDocument(id, metadata) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('personal_documents')
    .update(metadata)
    .match({ id, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw new Error(`Error updating document: ${error.message}`);
  return data;
}

export async function deleteDocument(document) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  // 1. Delete Storage object if it exists
  if (document.file_path) {
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([document.file_path]);

    if (storageError) {
      throw new Error(`Error deleting file from storage: ${storageError.message}`);
    }
  }

  // 2. Delete database row only if Storage deletion succeeded (or if no file_path)
  const { error: dbError } = await supabase
    .from('personal_documents')
    .delete()
    .match({ id: document.id, user_id: userData.user.id });

  if (dbError) throw new Error(`Error deleting document record: ${dbError.message}`);
  return true;
}

export async function createDocumentSignedUrl(filePath) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User not authenticated');

  if (!filePath) throw new Error('File path is required');

  const { data, error } = await supabase.storage
    .from('user-documents')
    .createSignedUrl(filePath, 60); // 60 seconds

  if (error) {
    throw new Error(`Error generating signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
