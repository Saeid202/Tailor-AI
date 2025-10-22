import { supabase } from './client';

const db: any = supabase as any;

export async function startMeasurementSession(garment: 'shirt' | 'tshirt' | 'pant', unit: 'cm' | 'in' = 'cm') {
  const { data: userRes, error: uErr } = await db.auth.getUser();
  if (uErr) throw uErr;
  const user = userRes?.user;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await db
    .from('measurement_sessions')
    .insert({ user_id: user.id, garment, unit, status: 'created' })
    .select('*')
    .single();
  if (error) throw error;
  return data as any;
}

export async function saveReading(sessionId: string, label: string, value: number, unit: 'cm' | 'in', confidence?: number) {
  const { data, error } = await db
    .from('measurement_readings')
    .insert({ session_id: sessionId, label, value, unit, value_cm: unit === 'cm' ? value : value * 2.54, confidence })
    .select('*')
    .single();
  if (error) throw error;
  return data as any;
}

export async function completeSession(sessionId: string) {
  const { error } = await db
    .from('measurement_sessions')
    .update({ status: 'processed' })
    .eq('id', sessionId);
  if (error) throw error;
}
