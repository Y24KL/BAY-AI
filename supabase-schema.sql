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
  payername text,
  payref text,
  paydate date,
  payamount text,
  passport_photo text,     -- stored as a data URL; fine for launch, move to
                            -- Supabase Storage later if the table gets large
  receipt_name text,
  receipt_file text,       -- the uploaded receipt itself, as a data URL
  pay_method text not null default 'now',        -- 'now' | 'venue'
  payment_status text not null default 'pending' -- 'pending' | 'approved' | 'venue'
);

create index if not exists registrations_payref_idx on registrations (payref);

-- The server connects with the service-role key (bypasses Row Level
-- Security), so RLS can stay locked down. If you'd rather use the anon key
-- instead, enable RLS and add policies permitting the operations you need:
-- alter table registrations enable row level security;

-- If your table already existed before these columns were added, run this
-- instead of (or in addition to) the create table above — it's safe to run
-- even if the columns/constraints are already there.
alter table registrations add column if not exists receipt_file text;
alter table registrations add column if not exists payment_status text not null default 'pending';
alter table registrations add column if not exists pay_method text not null default 'now';
alter table registrations alter column payref drop not null;
alter table registrations alter column paydate drop not null;
alter table registrations alter column payamount drop not null;
