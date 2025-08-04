
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create studios table
CREATE TABLE public.studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price_per_hour INTEGER NOT NULL, -- Price in cents
  amenities TEXT[],
  images TEXT[],
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_price INTEGER NOT NULL, -- Price in cents
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  guest_count INTEGER DEFAULT 1,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(studio_id, booking_date, start_time)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, studio_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  studio_id UUID REFERENCES public.studios(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Studios policies (public read, authenticated users can see all)
CREATE POLICY "Anyone can view active studios" ON public.studios
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their studios" ON public.studios
  FOR ALL USING (auth.uid() = host_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Studio hosts can view bookings for their studios" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.studios 
      WHERE studios.id = bookings.studio_id 
      AND studios.host_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = reviews.booking_id 
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample studios data
INSERT INTO public.studios (title, description, location, price_per_hour, amenities, images, rating, total_reviews) VALUES
('Downtown Podcast Studio', 'Professional podcast recording studio with high-end equipment and acoustic treatment.', 'Mumbai, Maharashtra', 250000, ARRAY['Microphones', 'Audio Interface', 'Headphones', 'Acoustic Treatment', 'Recording Software'], ARRAY['/placeholder.svg'], 4.8, 24),
('Creative Photography Loft', 'Spacious photography studio with natural lighting and professional equipment.', 'Bangalore, Karnataka', 320000, ARRAY['Professional Lighting', 'Backdrops', 'Props', 'Changing Room', 'WiFi'], ARRAY['/placeholder.svg'], 4.9, 18),
('Music Recording Studio', 'State-of-the-art music recording facility with premium instruments and mixing capabilities.', 'Delhi, NCR', 520000, ARRAY['Instruments', 'Mixing Console', 'Studio Monitors', 'Vocal Booth', 'Producer'], ARRAY['/placeholder.svg'], 4.7, 32),
('Video Production Studio', 'Complete video production setup with cameras, lighting, and editing facilities.', 'Chennai, Tamil Nadu', 450000, ARRAY['4K Cameras', 'Professional Lighting', 'Green Screen', 'Editing Suite', 'Audio Equipment'], ARRAY['/placeholder.svg'], 4.6, 15),
('Coworking Creative Space', 'Flexible creative workspace perfect for small productions and collaborative projects.', 'Pune, Maharashtra', 180000, ARRAY['Flexible Setup', 'WiFi', 'Projector', 'Whiteboard', 'Coffee'], ARRAY['/placeholder.svg'], 4.5, 28);
