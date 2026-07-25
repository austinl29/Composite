alter table techniques add column source_type text;
alter table techniques add constraint techniques_source_type_check
  check (source_type in (
    'peer-reviewed',
    'first-party-research',
    'secondary-verified',
    'vendor-benchmark',
    'promotional-testimonial'
  ));
