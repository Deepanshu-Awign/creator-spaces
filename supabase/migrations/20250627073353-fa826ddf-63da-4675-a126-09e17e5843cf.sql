
-- Create app role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- Create user_roles table to assign roles to users
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Create admin activity logs for audit trail
CREATE TABLE public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT, -- 'user', 'booking', 'studio', etc.
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create system settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create notifications table for admin notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Add admin-specific columns to existing tables
ALTER TABLE public.bookings ADD COLUMN admin_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.bookings ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.studios ADD COLUMN admin_notes TEXT;
ALTER TABLE public.studios ADD COLUMN approval_status TEXT DEFAULT 'approved';
ALTER TABLE public.studios ADD COLUMN approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.studios ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
$$;

-- Create RLS policies for user_roles table
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create RLS policies for admin_activity_logs
CREATE POLICY "Admins can view all activity logs"
ON public.admin_activity_logs
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Create RLS policies for system_settings
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Insert default system settings
INSERT INTO public.system_settings (key, value, category, description) VALUES
('site_name', '"BookMyStudio"', 'general', 'Site name displayed in the application'),
('site_description', '"Professional studio booking platform"', 'general', 'Site description for SEO'),
('booking_cancellation_hours', '24', 'booking', 'Hours before booking can be cancelled'),
('commission_rate', '0.10', 'payment', 'Platform commission rate (10%)'),
('max_booking_duration', '8', 'booking', 'Maximum booking duration in hours'),
('admin_email', '"admin@bookmystudio.com"', 'general', 'Admin contact email');

-- Create function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  _action TEXT,
  _target_type TEXT DEFAULT NULL,
  _target_id UUID DEFAULT NULL,
  _details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_logs (
    admin_user_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    auth.uid(),
    _action,
    _target_type,
    _target_id,
    _details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
