-- Tailor AI core schema, RLS and storage policies
-- Run in Supabase SQL editor or via migrations

-- Helper function for updated_at
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Helper to check admin role from profiles
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p where p.user_id = uid and p.role = 'admin'
  );
$$;

-- Enums
do $$ begin create type public.user_role as enum ('user','tailor','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.unit_system as enum ('cm','in'); exception when duplicate_object then null; end $$;
do $$ begin create type public.garment_enum as enum ('shirt','tshirt','pant'); exception when duplicate_object then null; end $$;
do $$ begin create type public.session_status as enum ('created','captured','processed','failed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('draft','pending','paid','fulfilled','cancelled','refunded'); exception when duplicate_object then null; end $$;

-- Profiles (1-1 with auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  unit public.unit_system not null default 'cm',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace trigger trg_profiles_updated_at
before update on public.profiles for each row execute procedure public.tg_set_updated_at();

alter table public.profiles enable row level security;
create policy "profiles.self.read" on public.profiles for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "profiles.self.insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles.self.update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Measurement sessions and readings
create table if not exists public.measurement_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  garment public.garment_enum not null,
  unit public.unit_system not null default 'cm',
  status public.session_status not null default 'created',
  device_info jsonb,
  capture_asset_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace trigger trg_ms_updated_at
before update on public.measurement_sessions for each row execute procedure public.tg_set_updated_at();

create table if not exists public.measurement_readings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.measurement_sessions(id) on delete cascade,
  label text not null,
  value numeric not null,
  unit public.unit_system not null default 'cm',
  value_cm numeric,
  confidence numeric,
  created_at timestamptz not null default now()
);
create index if not exists idx_readings_session on public.measurement_readings(session_id);

alter table public.measurement_sessions enable row level security;
alter table public.measurement_readings enable row level security;

create policy "ms.owner.read" on public.measurement_sessions for select using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy "ms.owner.write" on public.measurement_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mr.owner.read" on public.measurement_readings for select using (
  exists (select 1 from public.measurement_sessions s where s.id = session_id and s.user_id = auth.uid()) or public.is_admin(auth.uid())
);
create policy "mr.owner.write" on public.measurement_readings for all using (
  exists (select 1 from public.measurement_sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists (select 1 from public.measurement_sessions s where s.id = session_id and s.user_id = auth.uid())
);

-- Catalog
create table if not exists public.garment_types (
  id serial primary key,
  key text unique not null,
  label text not null
);

insert into public.garment_types(key,label) values ('shirt','Shirt'),('tshirt','T‑Shirt'),('pant','Pant') on conflict (key) do nothing;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  kind text not null check (kind in ('custom','ready_made','pattern')),
  garment public.garment_enum not null,
  base_price numeric(10,2) not null default 0,
  currency text not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace trigger trg_products_updated_at
before update on public.products for each row execute procedure public.tg_set_updated_at();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  position int not null default 0
);
create index if not exists idx_images_product on public.product_images(product_id);

create table if not exists public.fabrics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  material text,
  weight_gsm int,
  stretch_pct int,
  thumb_url text
);

create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex text not null
);

create table if not exists public.patterns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  category text,
  preview_url text
);

create table if not exists public.product_fabrics (
  product_id uuid references public.products(id) on delete cascade,
  fabric_id uuid references public.fabrics(id) on delete cascade,
  primary key(product_id, fabric_id)
);
create table if not exists public.product_colors (
  product_id uuid references public.products(id) on delete cascade,
  color_id uuid references public.colors(id) on delete cascade,
  primary key(product_id, color_id)
);
create table if not exists public.product_patterns (
  product_id uuid references public.products(id) on delete cascade,
  pattern_id uuid references public.patterns(id) on delete cascade,
  primary key(product_id, pattern_id)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  size_label text,
  price numeric(10,2),
  stock int,
  attrs jsonb
);
create index if not exists idx_variants_product on public.product_variants(product_id);

-- Catalog RLS
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.fabrics enable row level security;
alter table public.colors enable row level security;
alter table public.patterns enable row level security;
alter table public.product_fabrics enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_patterns enable row level security;
alter table public.product_variants enable row level security;

-- Public read policies
create policy "catalog.public.products" on public.products for select using (true);
create policy "catalog.public.images" on public.product_images for select using (true);
create policy "catalog.public.fabrics" on public.fabrics for select using (true);
create policy "catalog.public.colors" on public.colors for select using (true);
create policy "catalog.public.patterns" on public.patterns for select using (true);
create policy "catalog.public.pf" on public.product_fabrics for select using (true);
create policy "catalog.public.pc" on public.product_colors for select using (true);
create policy "catalog.public.pp" on public.product_patterns for select using (true);
create policy "catalog.public.variants" on public.product_variants for select using (true);

-- Admin write policies
create policy "catalog.admin.products" on public.products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.images" on public.product_images for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.fabrics" on public.fabrics for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.colors" on public.colors for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.patterns" on public.patterns for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.pf" on public.product_fabrics for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.pc" on public.product_colors for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.pp" on public.product_patterns for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "catalog.admin.variants" on public.product_variants for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Commerce
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace trigger trg_carts_updated_at
before update on public.carts for each row execute procedure public.tg_set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  config jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

create policy "carts.owner.read" on public.carts for select using (auth.uid() = user_id);
create policy "carts.owner.write" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cart_items.owner.read" on public.cart_items for select using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "cart_items.owner.write" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('shipping','billing')),
  full_name text,
  line1 text, line2 text, city text, state text, postal_code text, country text,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.addresses enable row level security;
create policy "addresses.owner" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'pending',
  currency text not null default 'USD',
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  shipping_address_id uuid references public.addresses(id),
  billing_address_id uuid references public.addresses(id),
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity int not null,
  unit_price numeric(10,2) not null,
  config jsonb
);
create index if not exists idx_order_items_order on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "orders.owner" on public.orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "order_items.owner" on public.order_items for all using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())) with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Social
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.wishlists enable row level security;
create policy "wishlists.owner" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "reviews.public.read" on public.reviews for select using (true);
create policy "reviews.owner.write" on public.reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage buckets (id is both PK and name)
insert into storage.buckets (id, name, public) values
  ('product-images','product-images', true),
  ('pattern-assets','pattern-assets', true),
  ('captures','captures', false)
on conflict (id) do nothing;

-- Storage policies
create policy "public read product images" on storage.objects for select using (bucket_id in ('product-images','pattern-assets'));
create policy "captures owner read" on storage.objects for select using (bucket_id = 'captures' and auth.uid()::text = (storage.foldername(name)) );
create policy "captures owner write" on storage.objects for insert with check (bucket_id = 'captures' and auth.uid()::text = (storage.foldername(name)) );
