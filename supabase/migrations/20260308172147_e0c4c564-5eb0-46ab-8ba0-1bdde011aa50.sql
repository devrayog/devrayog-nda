
-- Create storage bucket for AI tutor file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-uploads', 'ai-uploads', true);

-- Allow authenticated users to upload to ai-uploads bucket
CREATE POLICY "Authenticated users can upload AI files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ai-uploads');

-- Allow public read access
CREATE POLICY "Public can read AI uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ai-uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own AI uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ai-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
