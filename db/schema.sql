create extension if not exists pgcrypto;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'draft',
  file_name text,
  file_size_bytes integer,
  page_count integer,
  sender_name text,
  sender_address_line1 text,
  sender_address_line2 text,
  sender_city text,
  sender_state text,
  sender_postal_code text,
  sender_country text default 'US',
  recipient_name text,
  recipient_address_line1 text,
  recipient_address_line2 text,
  recipient_city text,
  recipient_state text,
  recipient_postal_code text,
  recipient_country text default 'US',
  price_cents integer,
  proof_level text not null default 'standard',
  currency text default 'usd',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  lob_letter_id text,
  lob_expected_delivery_date date,
  lob_tracking_events jsonb default '[]'::jsonb,
  lob_raw_response jsonb,
  upload_path text,
  final_pdf_path text,
  public_lookup_token text unique not null default encode(gen_random_bytes(32), 'hex'),
  user_agent text,
  ip_hash text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  submitted_to_provider_at timestamptz,
  mailed_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null,
  raw_event jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status);
create index orders_email_idx on public.orders(email);
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_stripe_session_idx on public.orders(stripe_checkout_session_id);
create index orders_lob_letter_idx on public.orders(lob_letter_id);
create index order_events_order_id_idx on public.order_events(order_id);
create index webhook_events_provider_event_id_idx on public.webhook_events(provider_event_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();
