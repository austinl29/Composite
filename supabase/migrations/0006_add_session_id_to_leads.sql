alter table leads add column session_id uuid references diagnose_sessions(id);

create index leads_session_id_idx on leads(session_id);
