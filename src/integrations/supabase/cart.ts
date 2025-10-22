import { supabase } from './client';

const db: any = supabase as any;

export async function getOrCreateCart() {
  const { data: userRes, error: uErr } = await db.auth.getUser();
  if (uErr) throw uErr;
  const user = userRes?.user;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await db.from('carts').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: created, error: insErr } = await db.from('carts').insert({ user_id: user.id }).select('*').single();
  if (insErr) throw insErr;
  return created;
}

export async function addToCart(productId: string, quantity = 1, config?: Record<string, unknown>) {
  const cart = await getOrCreateCart();
  const { data: product, error: pErr } = await db.from('products').select('base_price').eq('id', productId).single();
  if (pErr) throw pErr;

  const { data, error } = await db
    .from('cart_items')
    .insert({ cart_id: cart.id, product_id: productId, quantity, unit_price: product.base_price, config })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getCartItems() {
  const cart = await getOrCreateCart();
  const { data, error } = await db
    .from('cart_items')
    .select('id, quantity, unit_price, config, product:products(id, name, slug, product_images(url, is_primary))')
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Array<any>;
}
