-- Create enum types for user roles and project status
CREATE TYPE public.user_role AS ENUM ('worker', 'owner', 'supplier');
CREATE TYPE public.project_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.bid_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.skill_category AS ENUM ('laborer', 'mason', 'electrician', 'carpenter', 'plumber', 'painter', 'welder');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker profiles table for specific worker data
CREATE TABLE public.worker_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  skills skill_category[] NOT NULL DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  availability BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create owner profiles table for project owners
CREATE TABLE public.owner_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier profiles table
CREATE TABLE public.supplier_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_license TEXT,
  material_categories TEXT[] DEFAULT '{}',
  delivery_radius INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  required_skills skill_category[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  status project_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bids table for worker applications
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposed_rate DECIMAL(10,2) NOT NULL,
  message TEXT,
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, worker_id)
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  available_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create material orders table
CREATE TABLE public.material_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for worker profiles
CREATE POLICY "Anyone can view worker profiles" ON public.worker_profiles FOR SELECT USING (true);
CREATE POLICY "Workers can update their own profile" ON public.worker_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Workers can insert their own profile" ON public.worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for owner profiles
CREATE POLICY "Anyone can view owner profiles" ON public.owner_profiles FOR SELECT USING (true);
CREATE POLICY "Owners can update their own profile" ON public.owner_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert their own profile" ON public.owner_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for supplier profiles
CREATE POLICY "Anyone can view supplier profiles" ON public.supplier_profiles FOR SELECT USING (true);
CREATE POLICY "Suppliers can update their own profile" ON public.supplier_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Suppliers can insert their own profile" ON public.supplier_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Anyone can view open projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Owners can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for bids
CREATE POLICY "Project owners and bid workers can view bids" ON public.bids FOR SELECT USING (
  auth.uid() = worker_id OR 
  auth.uid() IN (SELECT owner_id FROM public.projects WHERE id = project_id)
);
CREATE POLICY "Workers can create bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Workers can update their own bids" ON public.bids FOR UPDATE USING (auth.uid() = worker_id);
CREATE POLICY "Project owners can update bid status" ON public.bids FOR UPDATE USING (
  auth.uid() IN (SELECT owner_id FROM public.projects WHERE id = project_id)
);

-- RLS Policies for materials
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Suppliers can manage their materials" ON public.materials FOR ALL USING (auth.uid() = supplier_id);

-- RLS Policies for material orders
CREATE POLICY "Related users can view orders" ON public.material_orders FOR SELECT USING (
  auth.uid() IN (
    SELECT owner_id FROM public.projects WHERE id = project_id
    UNION
    SELECT supplier_id FROM public.materials WHERE id = material_id
  )
);
CREATE POLICY "Project owners can create orders" ON public.material_orders FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT owner_id FROM public.projects WHERE id = project_id)
);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for completed projects" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND status = 'completed'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON public.worker_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE ON public.owner_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON public.supplier_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_material_orders_updated_at BEFORE UPDATE ON public.material_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name)
  VALUES (
    NEW.id, 
    (NEW.raw_user_meta_data ->> 'role')::user_role,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();