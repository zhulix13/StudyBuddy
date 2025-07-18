-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated downloads"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );
