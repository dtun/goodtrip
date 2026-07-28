-- Pre-launch waitlist for the landing page.
-- Unlike every other table, this one is not trip-scoped: the landing page
-- collects sign-ups before anyone has an account. So the public (anon) may
-- INSERT their own email but can never read the list back — sign-up is
-- write-only, and the roster is service-role / dashboard only.

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  -- Stored already normalized (trimmed + lowercased) by the app, so a plain
  -- unique constraint is enough to dedupe repeat sign-ups.
  email text not null unique check (char_length(email) between 3 and 254),
  source text,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone may add themselves to the list…
grant insert on public.waitlist to anon, authenticated;

create policy "anyone can join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- …but nobody reads, updates, or deletes it through the public API — there is
-- deliberately no SELECT/UPDATE/DELETE policy, so RLS denies all of them.
