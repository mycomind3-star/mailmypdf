alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.payments enable row level security;
alter table public.admin_users enable row level security;
alter table public.webhook_events enable row level security;

-- Private bucket expected by the MVP:
-- letter-uploads
-- Upload and file access should be server-mediated in this MVP.

