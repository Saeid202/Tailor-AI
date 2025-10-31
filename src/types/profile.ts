export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface UserProfile {
  id: string;
  email: string;
  
  // Basic Information
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  
  // Address Information
  street_address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  
  // Additional Information
  preferred_style?: string;
  clothing_preferences?: string[];
  avatar_url?: string;
  
  // Status
  profile_completed: boolean;
  measurements_completed: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export type MeasurementMethod = 'manual' | 'ai_camera' | 'professional';
export type MeasurementUnit = 'cm' | 'inch';

export interface BodyMeasurements {
  id: string;
  user_id: string;
  
  // General
  height?: number;
  weight?: number;
  
  // Upper Body
  neck_circumference?: number;
  shoulder_width?: number;
  chest_circumference?: number;
  bust_circumference?: number;
  waist_circumference?: number;
  upper_arm_circumference?: number;
  wrist_circumference?: number;
  arm_length?: number;
  sleeve_length?: number;
  back_width?: number;
  front_length?: number;
  back_length?: number;
  
  // Lower Body
  hip_circumference?: number;
  thigh_circumference?: number;
  knee_circumference?: number;
  calf_circumference?: number;
  ankle_circumference?: number;
  inseam_length?: number;
  outseam_length?: number;
  rise?: number;
  
  // Shoe Size
  shoe_size_us?: number;
  shoe_size_eu?: number;
  shoe_size_uk?: number;
  foot_length?: number;
  foot_width?: number;
  
  // Metadata
  measurement_method?: MeasurementMethod;
  measurement_unit: MeasurementUnit;
  confidence_score?: number;
  notes?: string;
  model_url?: string;
  scan_session_id?: string;
  
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GarmentType = 'shirt' | 'pants' | 'jacket' | 'dress' | 'shoes' | 'other';
export type FitPreference = 'slim' | 'regular' | 'relaxed' | 'oversized';
export type LengthPreference = 'short' | 'regular' | 'long';

export interface SizePreference {
  id: string;
  user_id: string;
  garment_type: GarmentType;
  standard_size?: string;
  fit_preference?: FitPreference;
  length_preference?: LengthPreference;
  adjustments?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'measuring' 
  | 'cutting' 
  | 'sewing' 
  | 'quality_check' 
  | 'completed' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type OrderType = 'standard' | 'personal_tailor';

export interface CustomOrder {
  id: string;
  user_id: string;
  product_id: string;
  order_type: OrderType;
  
  measurements_snapshot: BodyMeasurements;
  
  fabric_type?: string;
  fabric_color?: string;
  pattern?: string;
  custom_features?: Record<string, any>;
  
  base_price: number;
  customization_price: number;
  total_price: number;
  
  status: OrderStatus;
  special_instructions?: string;
  
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  delivered_at?: string;
}

export interface EmailVerificationCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  verified: boolean;
  attempts: number;
  created_at: string;
}

// Form data types
export interface BasicInfoForm {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: Gender;
}

export interface AddressForm {
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

export interface PreferencesForm {
  preferred_style: string;
  clothing_preferences: string[];
}

export interface RegistrationForm extends BasicInfoForm, AddressForm {
  email: string;
  password: string;
}

