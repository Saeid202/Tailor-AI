import { supabase } from './client';

// Use loose typing to avoid depending on generated Database types
const db: any = supabase as any;

export async function listProducts() {
  const { data, error } = await db
    .from('products')
    .select('id, slug, name, description, kind, garment, base_price, currency, active, product_images(url, is_primary, position)')
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Array<any>;
}

export async function listFabrics() {
  const { data, error } = await db.from('fabrics').select('*').order('name');
  if (error) throw error;
  return data as Array<any>;
}

export async function listPatterns() {
  const { data, error } = await db.from('patterns').select('*').order('name');
  if (error) throw error;
  return data as Array<any>;
}
