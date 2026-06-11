-- Run this in your Supabase project's SQL editor (Database > SQL Editor)

create table if not exists reviews (
  id          bigint generated always as identity primary key,
  name        text not null,
  message     text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table reviews enable row level security;

-- Allow anyone to submit a review (it lands as approved = false)
create policy "Anyone can submit a review"
  on reviews
  for insert
  to anon
  with check (approved = false);

-- Allow anyone to read only approved reviews
create policy "Anyone can read approved reviews"
  on reviews
  for select
  to anon
  using (approved = true);

-- To approve a review, go to Table Editor > reviews and toggle
-- "approved" to true on the row, or run:
--   update reviews set approved = true where id = <review_id>;
