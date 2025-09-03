-- Harden function search_path to prevent search path hijacking
-- Note: This does not change business logic or permissions

CREATE OR REPLACE FUNCTION public.update_studio_host_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
    UPDATE public.studios 
    SET host_name = NEW.full_name
    WHERE host_id = NEW.id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_studio_host_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
    UPDATE public.studios 
    SET host_name = profiles.full_name
    FROM public.profiles 
    WHERE studios.id = NEW.id 
    AND studios.host_id = profiles.id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_review_user_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
    UPDATE public.reviews 
    SET user_full_name = NEW.full_name
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_review_user_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $function$
BEGIN
    UPDATE public.reviews 
    SET user_full_name = profiles.full_name
    FROM public.profiles 
    WHERE reviews.id = NEW.id 
    AND reviews.user_id = profiles.id;
    
    RETURN NEW;
END;
$function$;