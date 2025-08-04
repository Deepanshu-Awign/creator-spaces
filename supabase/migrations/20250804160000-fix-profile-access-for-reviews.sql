-- Add policy to allow public read access to profiles for review purposes
-- This is needed so that reviewer names can be displayed in reviews

CREATE POLICY "Anyone can view profiles for review purposes" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Add policy to allow viewing profiles for studio hosts
CREATE POLICY "Studio hosts can view user profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.studios 
    WHERE studios.host_id = auth.uid()
  )
); 