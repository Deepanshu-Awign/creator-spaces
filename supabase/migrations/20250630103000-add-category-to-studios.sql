-- Add category column to studios table
ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for better performance on category queries
CREATE INDEX IF NOT EXISTS idx_studios_category ON public.studios(category);

-- Update existing studios with category based on their tags or description
UPDATE public.studios 
SET category = CASE 
  WHEN tags && ARRAY['photography', 'photo', 'camera'] THEN 'Photography'
  WHEN tags && ARRAY['music', 'recording', 'audio'] THEN 'Music Recording'
  WHEN tags && ARRAY['podcast', 'mic', 'microphone'] THEN 'Podcast'
  WHEN tags && ARRAY['video', 'production', 'filming'] THEN 'Video Production'
  WHEN tags && ARRAY['coworking', 'office', 'workspace'] THEN 'Coworking'
  WHEN tags && ARRAY['event', 'party', 'celebration'] THEN 'Event Spaces'
  ELSE 'General'
END
WHERE category IS NULL; 