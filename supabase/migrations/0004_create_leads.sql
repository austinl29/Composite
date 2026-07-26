create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  problem text not null,
  technique_id uuid not null references techniques(id),
  technique_name text not null,
  business_context text,
  followup_answers jsonb not null default '[]',
  grounded_plan_text text not null,
  composite_insight_text text,
  path_forward_text text,
  submitted_at timestamptz not null default now()
);
