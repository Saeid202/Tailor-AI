import { supabase } from './client';
import type { UserProfile, BodyMeasurements, SizePreference, CustomOrder } from '@/types/profile';

// ==================== User Profiles ====================

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
};

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert([profile], { 
      onConflict: 'id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
};

// ==================== Body Measurements ====================

export const getActiveMeasurements = async (userId: string) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data as BodyMeasurements | null;
};

export const getAllMeasurements = async (userId: string) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BodyMeasurements[];
};

export const createMeasurements = async (measurements: Partial<BodyMeasurements>) => {
  // Deactivate previous active measurements
  if (measurements.user_id) {
    await supabase
      .from('body_measurements')
      .update({ is_active: false })
      .eq('user_id', measurements.user_id)
      .eq('is_active', true);
  }

  const { data, error } = await supabase
    .from('body_measurements')
    .insert([{ ...measurements, is_active: true }])
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurements;
};

export const updateMeasurements = async (
  measurementId: string,
  updates: Partial<BodyMeasurements>
) => {
  const { data, error } = await supabase
    .from('body_measurements')
    .update(updates)
    .eq('id', measurementId)
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurements;
};

export const setActiveMeasurement = async (userId: string, measurementId: string) => {
  // Deactivate all measurements for user
  await supabase
    .from('body_measurements')
    .update({ is_active: false })
    .eq('user_id', userId);

  // Activate selected measurement
  const { data, error } = await supabase
    .from('body_measurements')
    .update({ is_active: true })
    .eq('id', measurementId)
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurements;
};

// ==================== Size Preferences ====================

export const getSizePreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('size_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as SizePreference[];
};

export const getSizePreferenceByGarment = async (userId: string, garmentType: string) => {
  const { data, error } = await supabase
    .from('size_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('garment_type', garmentType)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SizePreference | null;
};

export const upsertSizePreference = async (preference: Partial<SizePreference>) => {
  const { data, error } = await supabase
    .from('size_preferences')
    .upsert([preference], { onConflict: 'user_id,garment_type' })
    .select()
    .single();

  if (error) throw error;
  return data as SizePreference;
};

// ==================== Custom Orders ====================

export const getCustomOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('custom_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CustomOrder[];
};

export const getCustomOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('custom_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data as CustomOrder;
};

export const createCustomOrder = async (order: Partial<CustomOrder>) => {
  const { data, error } = await supabase
    .from('custom_orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data as CustomOrder;
};

export const updateCustomOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('custom_orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as CustomOrder;
};

// ==================== Email Verification ====================

export const createVerificationCode = async (email: string, code: string) => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

  const { data, error } = await supabase
    .from('email_verification_codes')
    .insert([{
      email,
      code,
      expires_at: expiresAt.toISOString(),
      verified: false,
      attempts: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const verifyCode = async (email: string, code: string) => {
  // Get the most recent unverified code for this email
  const { data: codeData, error: fetchError } = await supabase
    .from('email_verification_codes')
    .select('*')
    .eq('email', email)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError) throw new Error('Verification code not found');
  
  // Check if expired
  if (new Date(codeData.expires_at) < new Date()) {
    throw new Error('Verification code expired');
  }

  // Check attempts
  if (codeData.attempts >= 3) {
    throw new Error('Too many failed attempts');
  }

  // Check if code matches
  if (codeData.code !== code) {
    // Increment attempts
    await supabase
      .from('email_verification_codes')
      .update({ attempts: codeData.attempts + 1 })
      .eq('id', codeData.id);
    
    throw new Error('Invalid verification code');
  }

  // Mark as verified
  const { data, error } = await supabase
    .from('email_verification_codes')
    .update({ verified: true })
    .eq('id', codeData.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const checkUserExists = async (email: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

