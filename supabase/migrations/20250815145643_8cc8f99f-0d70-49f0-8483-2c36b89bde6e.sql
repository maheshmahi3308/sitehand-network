-- Fix function search path security warnings by setting search_path explicitly

-- Drop and recreate the update_updated_at_column function with proper security
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop and recreate the handle_new_user function with proper security
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (
    NEW.id, 
    (NEW.raw_user_meta_data ->> 'role')::public.user_role,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  -- Create role-specific profile
  IF (NEW.raw_user_meta_data ->> 'role') = 'worker' THEN
    INSERT INTO public.worker_profiles (user_id) VALUES (NEW.id);
  ELSIF (NEW.raw_user_meta_data ->> 'role') = 'owner' THEN
    INSERT INTO public.owner_profiles (user_id) VALUES (NEW.id);
  ELSIF (NEW.raw_user_meta_data ->> 'role') = 'supplier' THEN
    INSERT INTO public.supplier_profiles (user_id, business_name) 
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'business_name', ''));
  END IF;
  
  RETURN NEW;
END;
$$;