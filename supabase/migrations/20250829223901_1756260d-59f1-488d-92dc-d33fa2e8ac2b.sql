
-- 1) Tabela de perfis sincronizada com auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Habilitar RLS
alter table public.profiles enable row level security;

-- Permitir que usuários autenticados vejam todos os perfis (ambiente interno HYPR)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Authenticated users can view all profiles'
  ) then
    create policy "Authenticated users can view all profiles"
      on public.profiles
      for select
      to authenticated
      using (true);
  end if;
end $$;

-- Trigger para manter updated_at
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'profiles_set_timestamp'
  ) then
    create trigger profiles_set_timestamp
      before update on public.profiles
      for each row execute procedure public.update_updated_at_column();
  end if;
end $$;

-- 2) Funções e triggers para sincronizar com auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_updated_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
     set email = new.email,
         updated_at = now()
   where id = new.id;
  return new;
end;
$$;

-- Criar/atualizar triggers em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute procedure public.handle_updated_user();

-- 3) Backfill de perfis existentes
insert into public.profiles (id, email)
select u.id, u.email
  from auth.users u
 where not exists (
   select 1 from public.profiles p where p.id = u.id
 );

-- 4) Chave estrangeira campaigns.user_id -> profiles.id
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'campaigns_user_id_fkey'
  ) then
    alter table public.campaigns
      add constraint campaigns_user_id_fkey
      foreign key (user_id)
      references public.profiles(id)
      on delete set null;
  end if;
end $$;
