CREATE TYPE user_role AS ENUM ('guest', 'admin');

CREATE TABLE IF NOT EXISTS accounts (
  id bigint generated always as identity primary key,
  email text unique not null,
  password text,
  role user_role not null default 'guest',
  created_at timestamptz not null default now()
);

UPDATE accounts SET role = 'admin' WHERE email = 'user@example.com';