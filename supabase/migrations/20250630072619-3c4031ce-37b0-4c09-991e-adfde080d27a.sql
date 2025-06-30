
-- Create storage bucket for studio images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-images',
  'studio-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for studio images
CREATE POLICY "Studio images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'studio-images');

-- Allow authenticated users to upload studio images
CREATE POLICY "Authenticated users can upload studio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'studio-images' AND
  (LOWER(storage.extension(name)) = ANY(ARRAY['jpg', 'jpeg', 'png', 'webp']))
);

-- Allow studio owners and admins to update their studio images
CREATE POLICY "Studio owners and admins can update studio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'studio-images' AND
  (
    EXISTS (
      SELECT 1 FROM public.studios 
      WHERE host_id = auth.uid() 
      AND images @> ARRAY[storage.objects.name]
    ) OR
    public.is_admin(auth.uid())
  )
);

-- Allow studio owners and admins to delete their studio images
CREATE POLICY "Studio owners and admins can delete studio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'studio-images' AND
  (
    EXISTS (
      SELECT 1 FROM public.studios 
      WHERE host_id = auth.uid() 
      AND images @> ARRAY[storage.objects.name]
    ) OR
    public.is_admin(auth.uid())
  )
);

-- Add new location columns to studios table
ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_studios_city ON public.studios(city);
CREATE INDEX IF NOT EXISTS idx_studios_location ON public.studios(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_studios_pincode ON public.studios(pincode);

-- Update existing studios to extract city from location field where possible
UPDATE public.studios 
SET city = TRIM(SPLIT_PART(location, ',', 1))
WHERE city IS NULL AND location IS NOT NULL AND location != '';
