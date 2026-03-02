-- Schéma Supabase pour le système de gestion des livreurs (MVP)
-- Compatible avec Postgres / Supabase (auth.users, RLS activé)

-- Extensions utiles
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'livreur', 'client')),
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.transport_types (
  id bigserial primary key,
  nom text not null,
  vitesse_moyenne_kmh integer not null check (vitesse_moyenne_kmh > 0),
  capacite_max integer not null check (capacite_max > 0)
);

create table if not exists public.livreurs (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  statut text not null check (statut in ('disponible', 'en_livraison', 'pause', 'hors_ligne')),
  transport_type_id bigint not null references public.transport_types (id),
  latitude double precision,
  longitude double precision,
  actif boolean not null default true
);

create table if not exists public.type_commandes (
  id bigserial primary key,
  nom text not null,
  description text,
  poids_max integer not null check (poids_max > 0)
);

create table if not exists public.commandes (
  id bigserial primary key,
  client_id uuid not null references public.profiles (id) on delete restrict,
  type_commande_id bigint not null references public.type_commandes (id),
  statut text not null check (statut in ('en_attente', 'assignee', 'en_cours', 'livree', 'annulee')) default 'en_attente',
  livreur_id bigint references public.livreurs (id),
  prix numeric(10,2) not null check (prix >= 0),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  assigned_at timestamp with time zone,
  delivered_at timestamp with time zone,
  eta_minutes integer
);

create table if not exists public.adresses (
  id bigserial primary key,
  commande_id bigint not null references public.commandes (id) on delete cascade,
  type text not null check (type in ('depart', 'livraison')),
  adresse_text text not null,
  latitude double precision not null,
  longitude double precision not null
);

-- Index de confort
create index if not exists idx_commandes_client_id on public.commandes (client_id);
create index if not exists idx_commandes_livreur_id on public.commandes (livreur_id);
create index if not exists idx_adresses_commande_id on public.adresses (commande_id);
create index if not exists idx_livreurs_user_id on public.livreurs (user_id);

-- ---------------------------------------------------------------------------
-- FONCTIONS D'AIDE
-- ---------------------------------------------------------------------------

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_livreur()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'livreur'
  );
$$;

create or replace function public.is_client()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'client'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS & POLITIQUES
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.transport_types enable row level security;
alter table public.livreurs enable row level security;
alter table public.type_commandes enable row level security;
alter table public.commandes enable row level security;
alter table public.adresses enable row level security;

-- PROFILES
drop policy if exists "Profiles admin full access" on public.profiles;
drop policy if exists "Profiles user own row" on public.profiles;

create policy "Profiles admin full access"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Profiles user own row"
on public.profiles
for select using (id = auth.uid());

-- TRANSPORT_TYPES (catalogue: lecture pour tous, écriture admin)
drop policy if exists "Transport types admin full access" on public.transport_types;
drop policy if exists "Transport types read all" on public.transport_types;

create policy "Transport types read all"
on public.transport_types
for select
using (true);

create policy "Transport types admin full access"
on public.transport_types
for all
using (public.is_admin())
with check (public.is_admin());

-- LIVREURS
drop policy if exists "Livreurs admin full access" on public.livreurs;
drop policy if exists "Livreurs own row" on public.livreurs;
drop policy if exists "Livreurs visible to all" on public.livreurs;

create policy "Livreurs admin full access"
on public.livreurs
for all
using (public.is_admin())
with check (public.is_admin());

-- Un livreur peut voir/modifier son propre enregistrement (statut, position)
create policy "Livreurs own row"
on public.livreurs
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Les autres rôles peuvent lire les livreurs actifs (pour assignation / suivi)
create policy "Livreurs visible to all"
on public.livreurs
for select
using (actif = true);

-- TYPE_COMMANDES (catalogue)
drop policy if exists "Type commandes read all" on public.type_commandes;
drop policy if exists "Type commandes admin full access" on public.type_commandes;

create policy "Type commandes read all"
on public.type_commandes
for select
using (true);

create policy "Type commandes admin full access"
on public.type_commandes
for all
using (public.is_admin())
with check (public.is_admin());

-- COMMANDES
drop policy if exists "Commandes admin full access" on public.commandes;
drop policy if exists "Commandes client access" on public.commandes;
drop policy if exists "Commandes livreur access" on public.commandes;

-- Admin : accès complet
create policy "Commandes admin full access"
on public.commandes
for all
using (public.is_admin())
with check (public.is_admin());

-- Client : ne voit que ses commandes, peut créer et mettre à jour les siennes
create policy "Commandes client access"
on public.commandes
for all
using (client_id = auth.uid() and public.is_client())
with check (client_id = auth.uid() and public.is_client());

-- Livreur : voit uniquement ses commandes assignées, peut mettre à jour le statut
create policy "Commandes livreur access"
on public.commandes
for select using (
  public.is_livreur()
  and livreur_id in (
    select l.id
    from public.livreurs l
    where l.user_id = auth.uid()
  )
);

-- ADRESSES
drop policy if exists "Adresses admin full access" on public.adresses;
drop policy if exists "Adresses related to visible commandes" on public.adresses;

create policy "Adresses admin full access"
on public.adresses
for all
using (public.is_admin())
with check (public.is_admin());

-- Un utilisateur peut voir les adresses des commandes qu'il est autorisé à voir
create policy "Adresses related to visible commandes"
on public.adresses
for select
using (
  exists (
    select 1
    from public.commandes c
    where c.id = commande_id
      and (
        public.is_admin()
        or (public.is_client() and c.client_id = auth.uid())
        or (
          public.is_livreur()
          and c.livreur_id in (
            select l.id from public.livreurs l where l.user_id = auth.uid()
          )
        )
      )
  )
);

-- ---------------------------------------------------------------------------
-- (Optionnel) Fonction d'assignation transactionnelle côté base
-- ---------------------------------------------------------------------------
-- Pour un futur durcissement, on pourra déplacer l'algorithme d'assignation
-- dans une fonction SQL ici (transaction atomique) et l'appeler via RPC
-- depuis services/assignmentService.ts. Pour le MVP, la logique reste
-- principalement côté service TypeScript.

