-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  
  -- Basic Information (Required)
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Address Information (Optional)
  street_address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Additional Information (Optional)
  preferred_style TEXT,
  clothing_preferences TEXT[],
  avatar_url TEXT,
  
  -- Profile Status
  profile_completed BOOLEAN DEFAULT FALSE,
  measurements_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body Measurements Table
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- General Measurements (cm)
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  
  -- Upper Body Measurements
  neck_circumference DECIMAL(5, 2),
  shoulder_width DECIMAL(5, 2),
  chest_circumference DECIMAL(5, 2),
  bust_circumference DECIMAL(5, 2),
  waist_circumference DECIMAL(5, 2),
  upper_arm_circumference DECIMAL(5, 2),
  wrist_circumference DECIMAL(5, 2),
  arm_length DECIMAL(5, 2),
  sleeve_length DECIMAL(5, 2),
  back_width DECIMAL(5, 2),
  front_length DECIMAL(5, 2),
  back_length DECIMAL(5, 2),
  
  -- Lower Body Measurements
  hip_circumference DECIMAL(5, 2),
  thigh_circumference DECIMAL(5, 2),
  knee_circumference DECIMAL(5, 2),
  calf_circumference DECIMAL(5, 2),
  ankle_circumference DECIMAL(5, 2),
  inseam_length DECIMAL(5, 2),
  outseam_length DECIMAL(5, 2),
  rise DECIMAL(5, 2),
  
  -- Shoe Size
  shoe_size_us DECIMAL(4, 1),
  shoe_size_eu DECIMAL(4, 1),
  shoe_size_uk DECIMAL(4, 1),
  foot_length DECIMAL(5, 2),
  foot_width DECIMAL(5, 2),
  
  -- Metadata
  measurement_method TEXT CHECK (measurement_method IN ('manual', 'ai_camera', 'professional')),
  measurement_unit TEXT DEFAULT 'cm' CHECK (measurement_unit IN ('cm', 'inch')),
  confidence_score DECIMAL(3, 2),
  notes TEXT,
  
  -- 3D Model Reference (if scanned)
  model_url TEXT,
  scan_session_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One active measurement per user
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id, is_active) WHERE is_active = TRUE
);

-- Size Preferences Table (for different garment types)
CREATE TABLE IF NOT EXISTS public.size_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garment_type TEXT NOT NULL CHECK (garment_type IN ('shirt', 'pants', 'jacket', 'dress', 'shoes', 'other')),
  
  -- Standard Sizes
  standard_size TEXT, -- S, M, L, XL, etc.
  
  -- Custom Preferences
  fit_preference TEXT CHECK (fit_preference IN ('slim', 'regular', 'relaxed', 'oversized')),
  length_preference TEXT CHECK (length_preference IN ('short', 'regular', 'long')),
  
  -- Specific Adjustments
  adjustments JSONB, -- Store custom adjustments
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, garment_type)
);

-- Custom Orders Table
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  
  -- Order Details
  order_type TEXT DEFAULT 'personal_tailor' CHECK (order_type IN ('standard', 'personal_tailor')),
  
  -- Measurements Used (snapshot at order time)
  measurements_snapshot JSONB NOT NULL,
  
  -- Customizations
  fabric_type TEXT,
  fabric_color TEXT,
  pattern TEXT,
  custom_features JSONB, -- buttons, pockets, etc.
  
  -- Pricing
  base_price DECIMAL(10, 2),
  customization_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'measuring', 'cutting', 'sewing', 'quality_check', 'completed', 'shipped', 'delivered', 'cancelled')),
  
  -- Special Instructions
  special_instructions TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_delivery DATE,
  delivered_at TIMESTAMPTZ
);

-- Email Verification: Using Supabase's built-in OTP system
-- No custom table needed!

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_active ON public.body_measurements(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_size_preferences_user_id ON public.size_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_user_id ON public.custom_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON public.custom_orders(status);

-- Row Level Security (RLS) Policies

-- User Profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Body Measurements
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measurements"
  ON public.body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON public.body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON public.body_measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON public.body_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- Size Preferences
ALTER TABLE public.size_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own size preferences"
  ON public.size_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own size preferences"
  ON public.size_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own size preferences"
  ON public.size_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Custom Orders
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.custom_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.custom_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions for automatic updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_body_measurements
  BEFORE UPDATE ON public.body_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_size_preferences
  BEFORE UPDATE ON public.size_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_custom_orders
  BEFORE UPDATE ON public.custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

