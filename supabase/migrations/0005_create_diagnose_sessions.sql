create table diagnose_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  problem text not null,
  business_context text,
  technique_id uuid not null references techniques(id),
  technique_name text not null,
  confidence text not null check (confidence in ('strong', 'moderate', 'weak')),
  followup_answers jsonb not null default '[]',
  file_url text,
  file_filename text,
  file_content_type text,
  grounded_plan_text text not null,
  composite_insight_text text,
  path_forward_text text
);

create index diagnose_sessions_technique_id_idx on diagnose_sessions(technique_id);
create index diagnose_sessions_created_at_idx on diagnose_sessions(created_at);
