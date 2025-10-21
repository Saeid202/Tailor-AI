-- Create storage bucket for measurement images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'measurement-images',
  'measurement-images',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS policies for measurement images
CREATE POLICY "Users can upload their own measurement images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'measurement-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own measurement images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'measurement-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own measurement images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'measurement-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);