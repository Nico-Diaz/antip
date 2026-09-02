-- Supabase Auth guarda automáticamente cuentas y contraseñas en auth.users.
-- Este script crea la tabla public.profiles y un Trigger para copiar automáticamente
-- los usuarios registrados (ya sea por Email/Contraseña o Google OAuth) a la base de datos.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text default 'user',
  is_admin boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Crea perfiles para cuentas que ya existían antes de instalar este trigger.
insert into public.profiles (id, email, full_name, avatar_url)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

-- Tabla de Secciones de Videos
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sections enable row level security;

drop policy if exists "Authenticated users can read sections" on public.sections;
create policy "Authenticated users can read sections"
  on public.sections for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can write sections" on public.sections;
create policy "Authenticated users can write sections"
  on public.sections for all
  to authenticated
  using (true)
  with check (true);

-- Tabla de Videos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration int,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

drop policy if exists "Authenticated users can read videos" on public.videos;
create policy "Authenticated users can read videos"
  on public.videos for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can write videos" on public.videos;
create policy "Authenticated users can write videos"
  on public.videos for all
  to authenticated
  using (true)
  with check (true);


