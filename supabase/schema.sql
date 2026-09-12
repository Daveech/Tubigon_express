create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null check (role in ('customer','rider')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  rider_id uuid references public.profiles(id) on delete set null,
  restaurant_name text not null,
  items text not null,
  total numeric(10,2) not null check (total >= 0),
  delivery_address text not null,
  status text not null default 'pending' check (status in ('pending','accepted','picked_up','on_the_way','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'role','customer'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_order()
returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute procedure public.touch_order();

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

create policy "profiles own read" on public.profiles for select using (auth.uid()=id);
create policy "customers read own orders" on public.orders for select using (auth.uid()=customer_id);
create policy "riders read delivery orders" on public.orders for select using (
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='rider')
  and (rider_id=auth.uid() or status='pending')
);
create policy "customers create own orders" on public.orders for insert with check (
  auth.uid()=customer_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer')
);
create policy "rider updates assigned orders" on public.orders for update using (rider_id=auth.uid()) with check (rider_id=auth.uid());

create or replace function public.accept_order(p_order_id uuid)
returns public.orders
language plpgsql security definer set search_path=public as $$
declare result public.orders;
begin
  update public.orders
  set rider_id=auth.uid(), status='accepted', updated_at=now()
  where id=p_order_id and status='pending' and rider_id is null
    and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='rider')
  returning * into result;
  if result.id is null then raise exception 'Order is no longer available'; end if;
  return result;
end; $$;

grant execute on function public.accept_order(uuid) to authenticated;

alter publication supabase_realtime add table public.orders;


create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer','admin')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "customer reads own support chat" on public.support_messages
for select using (auth.uid()=customer_id);

create policy "customer sends support chat" on public.support_messages
for insert with check (
  auth.uid()=customer_id and sender_role='customer'
);

alter publication supabase_realtime add table public.support_messages;
