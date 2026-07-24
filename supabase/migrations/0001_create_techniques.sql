create extension if not exists pgcrypto;

create table techniques (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_industry text not null,
  source_company text,
  mechanism text not null,
  evidence text not null,
  target_verticals text[] not null default '{}',
  transfer_template text not null,
  problem_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
