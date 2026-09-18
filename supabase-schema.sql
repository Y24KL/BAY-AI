-- Run this once in Supabase → SQL Editor to create the table the server
-- (server/index.js) reads and writes.

create table if not exists registrations (
  id text primary key,
  issued_at timestamptz not null default now(),
  fullname text not null,
  email text not null,
  phone text not null,
  dob date not null,
  gender text,
  nationality text not null,
  stateorigin text,
  address text not null,
  work text,
  occupation text not null,
  orgname text,
  level text,
  gadgets text[] default '{}',
  internet text not null,
  starter text,
  starterwhat text,
  courses text[] not null default '{}',
  mode text,
  why text not null,
  after text not null,
  special text,
  payername text not null,
  payref text not null,
  paydate date not null,
  payamount text not null,
  passport_photo text,     -- stored as a data URL; fine for launch, move to
                            -- Supabase Storage later if the table gets large
  receipt_name text
);

create index if not exists registrations_payref_idx on registrations (payref);

-- The server connects with the service-role key (bypasses Row Level
-- Security), so RLS can stay locked down. If you'd rather use the anon key
-- instead, enable RLS and add policies permitting the operations you need:
-- alter table registrations enable row level security;
