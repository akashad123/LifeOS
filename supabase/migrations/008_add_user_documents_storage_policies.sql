-- ==============================================================================
-- 2. SUPABASE STORAGE RLS POLICIES
-- ==============================================================================
-- IMPORTANT: You must manually create the 'user-documents' bucket in the 
-- Supabase Dashboard BEFORE executing these policies.
-- 
-- Dashboard Configuration:
-- Name: user-documents
-- Public: OFF (Private)
-- Max File Size: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

-- SELECT Policy
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- INSERT Policy
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- UPDATE Policy
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- DELETE Policy
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
