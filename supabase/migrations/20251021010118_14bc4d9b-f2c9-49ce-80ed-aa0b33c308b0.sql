-- Create measurements table for storing user measurement history
CREATE TABLE public.measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  garment_type TEXT NOT NULL,
  measurements JSONB NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('cm', 'in')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own measurements" 
ON public.measurements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" 
ON public.measurements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements" 
ON public.measurements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX idx_measurements_created_at ON public.measurements(created_at DESC);