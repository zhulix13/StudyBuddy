-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND (auth.uid())::text = owner_id
  )
  WITH CHECK (
    bucket_id = 'avatars' AND (auth.uid())::text = owner_id
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletions"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND (auth.uid())::text = owner_id
  );
