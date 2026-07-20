-- GOODTrip seed data (spec section 16).
-- "Washington DC — America's 250th Birthday" · Jul 21–29 2026 · 9 days.
-- Content mirrors the family itinerary in apps/web/src/lib/trip.ts.
--
-- Local-dev seed: runs automatically on `supabase db reset`. The auth.users
-- inserts are stubs so profiles/memberships satisfy their FKs; real devices
-- sign in anonymously and self-join the trip (spec sections 4 and 13).
--
-- The trip id below is the value for GOODTRIP_TRIP_ID.

begin;

-- ── Family: stub auth users + profiles ──────────────────────────────────────

insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
  u.email, '', now(), '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb, now(), now()
from (values
  ('00000000-0000-4000-8000-000000000001'::uuid, 'danny@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'ellen@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'jack@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000004'::uuid, 'eva@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000005'::uuid, 'elizabeth@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000006'::uuid, 'elisha@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000007'::uuid, 'gg@goodtrip.local'),
  ('00000000-0000-4000-8000-000000000008'::uuid, 'papa@goodtrip.local')
) as u (id, email)
on conflict (id) do nothing;

insert into public.profiles (id, display_name, avatar_color) values
  ('00000000-0000-4000-8000-000000000001', 'Danny', '#3C3B6E'),
  ('00000000-0000-4000-8000-000000000002', 'Ellen', '#B22234'),
  ('00000000-0000-4000-8000-000000000003', 'Jack', '#2D6A4F'),
  ('00000000-0000-4000-8000-000000000004', 'Eva', '#C9A84C'),
  ('00000000-0000-4000-8000-000000000005', 'Elizabeth', '#4C5BC9'),
  ('00000000-0000-4000-8000-000000000006', 'Elisha', '#B7791F'),
  ('00000000-0000-4000-8000-000000000007', 'GG', '#6E3C5A'),
  ('00000000-0000-4000-8000-000000000008', 'Papa', '#3C6E5A')
on conflict (id) do nothing;

-- ── Trip + membership ───────────────────────────────────────────────────────

insert into public.trips (id, name, destination, start_date, end_date, lodging, created_by)
values (
  '11111111-1111-4111-8111-111111111111',
  'America''s 250th Birthday',
  'Washington, D.C.',
  '2026-07-21',
  '2026-07-29',
  'Residence Inn · 1199 Vermont Ave NW · McPherson Square',
  '00000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

insert into public.trip_members (trip_id, user_id, role)
select '11111111-1111-4111-8111-111111111111', p.id,
       case when p.id = '00000000-0000-4000-8000-000000000001' then 'owner' else 'member' end
from public.profiles p
where p.id::text like '00000000-0000-4000-8000-00000000000%'
on conflict (trip_id, user_id) do nothing;

-- ── Days ────────────────────────────────────────────────────────────────────

insert into public.days (id, trip_id, day_number, date, title) values
  ('dddddddd-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 1, '2026-07-21', 'Arrival & Settle In'),
  ('dddddddd-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 2, '2026-07-22', 'Capitol Tour + Ford’s Theatre'),
  ('dddddddd-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 3, '2026-07-23', 'Mount Vernon'),
  ('dddddddd-0000-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 4, '2026-07-24', 'Museum of the Bible'),
  ('dddddddd-0000-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 5, '2026-07-25', 'Rest Day + Monument Walk'),
  ('dddddddd-0000-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 6, '2026-07-26', 'Worship + Holocaust Museum'),
  ('dddddddd-0000-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 7, '2026-07-27', 'Museum of American History'),
  ('dddddddd-0000-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 8, '2026-07-28', 'National Archives + Dinner'),
  ('dddddddd-0000-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 9, '2026-07-29', 'Departure Day')
on conflict (trip_id, day_number) do nothing;

-- ── Activities ──────────────────────────────────────────────────────────────

insert into public.activities
  (trip_id, day_id, position, time_label, title, location, cost,
   confirmed, confirmed_note, booking_url, booking_code, booking_cta, tags)
values
  -- Day 1 · Arrival & Settle In
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000001', 0, '10:00 AM',
   'Southwest #2491 · PHX → BWI', 'Lands 5:25 PM · confs ATXHVU + AU62AD · seats at check-in', null,
   true, 'Booked', 'https://www.southwest.com/air/manage-reservation/', 'ATXHVU', 'Check in', '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000001', 1, '5:45 PM',
   'BWI → downtown D.C.', 'MARC Penn Line or drive · ~1 hr', null,
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000001', 2, 'Evening',
   'Check in & stock the kitchen', 'Residence Inn · CVS / Wawa', null,
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000001', 3, 'Evening',
   'White House at night', '12-min walk south · White House museum & store', 'Free',
   false, null, null, null, null, '{}'),

  -- Day 2 · Capitol Tour + Ford's Theatre
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000002', 0, '10:30 AM',
   'U.S. Capitol Building Tour', 'Meet: Mark Kelly’s office · Ste 516 Hart Senate Bldg', 'Free',
   true, 'Via Sen. Mark Kelly · map in email', null, null, null, '{history}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000002', 1, '1:30 PM',
   'Ford’s Theatre', '511 10th St NW', '$',
   false, null, 'https://fords.org/visit/tickets/', null, 'Tickets', '{history}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000002', 2, '3:00 PM',
   'Return to hotel — rest', 'Residence Inn', null,
   false, null, null, null, null, '{}'),

  -- Day 3 · Mount Vernon
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000003', 0, '10:00 AM',
   'Washington’s Mansion Tour', 'Mount Vernon, VA', '$$',
   true, 'Purchased · conf in email', 'https://www.mountvernon.org/plan-your-visit/buy-tickets/', null, 'Tickets', '{history}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000003', 1, '11:00 AM',
   '4D Revolutionary War Theater', 'On the estate · included with admission', null,
   false, null, null, null, null, '{kids}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000003', 2, '11:30 AM',
   'Enslaved People Tour', 'Specialty tour · on the estate', null,
   true, 'Purchased · conf in email', null, null, null, '{history}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000003', 3, '1:00 PM',
   'Through My Eyes Tour', 'Costumed character tour · on the estate', null,
   true, 'Purchased · conf in email', null, null, null, '{history}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000003', 4, 'Afternoon',
   'Mount Vernon Inn Restaurant', 'Colonial-inspired American', '$$',
   false, null, 'https://www.mountvernon.org/the-estate-gardens/location/mount-vernon-inn-restaurant', null, 'Reserve', '{}'),

  -- Day 4 · Museum of the Bible
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000004', 0, '1:00 PM',
   'Dead Sea Scrolls', 'Floor 5 · timed entry', '$$$',
   false, null, 'https://www.museumofthebible.org/tickets', 'CIC25', 'Tickets', '{museum}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000004', 1, '12:00 PM',
   'Megiddo Mosaic', 'Floor 1 lobby · oldest Christian site', 'Free',
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000004', 2, 'Anytime',
   'All Creation Sings', 'Immersive worship experience · flexible entry', null,
   false, null, null, null, null, '{kids}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000004', 3, 'Evening',
   'The Wharf dinner', 'Waterfront', '$$',
   false, null, 'https://www.wharfdc.com/restaurants/', null, 'Explore', '{}'),

  -- Day 5 · Rest Day + Monument Walk
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000005', 0, 'Morning',
   'Rest day — protect this', 'Unscheduled · sleep in', 'Free',
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000005', 1, 'Afternoon',
   'Air & Space Museum', 'National Air and Space Museum · free timed passes', 'Free',
   false, null, 'https://airandspace.si.edu/visit', null, 'Passes', '{museum,kids}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000005', 2, '6:00 PM',
   'Founding Farmers', '1924 Pennsylvania Ave NW · Foggy Bottom', '$$',
   false, null, 'https://www.foundingfarmers.com/location/founding-farmers-dc', null, 'Reserve', '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000005', 3, '7:00 PM',
   'Evening Monument Walk', 'Washington Monument → WWII → Lincoln Memorial', 'Free',
   false, null, 'https://www.nps.gov/linc/planyourvisit/index.htm', null, 'NPS info', '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000005', 4, '8:25 PM',
   'Sunset at the Reflecting Pool', 'National Mall', 'Free',
   false, null, null, null, null, '{}'),

  -- Day 6 · Worship + Holocaust Museum
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000006', 0, '10:30 AM',
   'Capitol Hill Baptist Church', '525 A St NE · pre-register children', 'Free',
   false, null, 'https://www.capitolhillbaptist.org/', null, 'Pre-register', '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000006', 1, '1:30 PM',
   'Holocaust Memorial Museum', '100 Raoul Wallenberg Pl SW', '$',
   true, 'Passes · entry 1:30–1:45', 'https://www.ushmm.org/visit/plan-your-visit/timed-entry-passes', null, 'Passes', '{museum}'),

  -- Day 7 · Museum of American History
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000007', 0, '10:00 AM',
   'Star-Spangled Banner', 'Nat. Museum of American History', 'Free',
   true, 'No reservations needed', 'https://americanhistory.si.edu/visit', null, 'Plan visit', '{museum}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000007', 1, '12:00 PM',
   'Mitsitam Native Foods Café', 'Museum of the American Indian', '$$',
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000007', 2, '5:00 PM',
   'National Portrait Gallery', 'Open until 7 PM', 'Free',
   true, 'No reservations needed', 'https://npg.si.edu/visit', null, 'Hours', '{}'),

  -- Day 8 · National Archives + Dinner
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000008', 0, '1:00 PM',
   'The Rotunda', 'Declaration · Constitution · Magna Carta', '$',
   true, 'Timed entry 1:00–1:15', 'https://www.archives.gov/dc/visit', null, 'Timed entry', '{history}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000008', 1, '3:30 PM',
   'Old Ebbitt Grill', '675 15th St NW · est. 1856 · party of 8', '$$$',
   true, 'Reserved', 'https://www.opentable.com/r/old-ebbitt-grill-washington', null, 'Reserve', '{}'),

  -- Day 9 · Departure Day
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000009', 0, 'Morning',
   'Final breakfast & checkout', 'Residence Inn', null,
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000009', 1, '12:00 PM',
   'Head to BWI', 'MARC Penn Line or drive · ~1 hr', null,
   false, null, null, null, null, '{}'),
  ('11111111-1111-4111-8111-111111111111', 'dddddddd-0000-4000-8000-000000000009', 2, '3:05 PM',
   'Southwest #1050 · BWI → PHX', 'Lands PHX 4:55 PM · confs ATXHVU + AU62AD', null,
   true, 'Booked', 'https://www.southwest.com/air/manage-reservation/', 'ATXHVU', 'Check in', '{}');

-- ── Global checklists (Clothing / Essentials / Documents) ───────────────────

insert into public.checklists (id, trip_id, day_id, title, position) values
  ('cccccccc-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', null, 'Clothing', 0),
  ('cccccccc-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', null, 'Essentials', 1),
  ('cccccccc-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', null, 'Documents', 2)
on conflict (id) do nothing;

insert into public.checklist_items
  (trip_id, checklist_id, label, position, done, done_by, done_at)
values
  -- Clothing
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000001',
   'Comfortable walking shoes', 0, true, '00000000-0000-4000-8000-000000000002', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000001',
   'Light sweater — museums are cold', 1, true, '00000000-0000-4000-8000-000000000007', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000001',
   'Compact rain poncho ×8', 2, true, '00000000-0000-4000-8000-000000000008', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000001',
   'Nice outfit for Old Ebbitt', 3, false, null, null),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000001',
   'Sunday church outfit', 4, false, null, null),
  -- Essentials
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000002',
   'Sunscreen SPF 50+', 0, true, '00000000-0000-4000-8000-000000000004', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000002',
   'Refillable water bottles', 1, true, '00000000-0000-4000-8000-000000000003', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000002',
   'Electrolyte packets', 2, true, null, now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000002',
   'Small backpack (no bags at Capitol)', 3, true, '00000000-0000-4000-8000-000000000001', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000002',
   'First aid kit + medications', 4, false, null, null),
  -- Documents
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000003',
   'REAL ID for all adults', 0, true, '00000000-0000-4000-8000-000000000002', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000003',
   'Southwest check-in — 24 hrs before each flight (ATXHVU + AU62AD)', 1, false, null, null),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000003',
   'Capitol Tour confirmation (Jul 22)', 2, true, '00000000-0000-4000-8000-000000000001', now()),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000003',
   'All ticket confirmations saved', 3, false, null, null),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000003',
   'Contactless cards for Metro', 4, false, null, null),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-0000-4000-8000-000000000003',
   'Emergency cash', 5, false, null, null);

-- ── Per-day Morning / Evening checklists (Days 2–8) ─────────────────────────

insert into public.checklists (trip_id, day_id, title, position)
select d.trip_id, d.id, c.title, c.position
from public.days d
cross join (values ('Morning', 0), ('Evening', 1)) as c (title, position)
where d.trip_id = '11111111-1111-4111-8111-111111111111'
  and d.day_number between 2 and 8;

insert into public.checklist_items (trip_id, checklist_id, label, position)
select c.trip_id, c.id, i.label, i.position
from public.checklists c
join public.days d on d.id = c.day_id
cross join (values
  ('Sunscreen on everyone', 0),
  ('Water bottles filled', 1),
  ('Timed-entry tickets confirmed', 2),
  ('Light sweater — museums are cold', 3),
  ('Count heads before leaving hotel', 4)
) as i (label, position)
where c.title = 'Morning'
  and d.trip_id = '11111111-1111-4111-8111-111111111111';

insert into public.checklist_items (trip_id, checklist_id, label, position)
select c.trip_id, c.id, i.label, i.position
from public.checklists c
join public.days d on d.id = c.day_id
cross join (values
  ('Charge phones & power banks', 0),
  ('Review tomorrow''s plan', 1),
  ('Refill water bottles', 2),
  ('Set out clothes for tomorrow', 3)
) as i (label, position)
where c.title = 'Evening'
  and d.trip_id = '11111111-1111-4111-8111-111111111111';

-- ── Activity feed ───────────────────────────────────────────────────────────

insert into public.activity_feed (trip_id, actor_id, verb, target, created_at)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000004',
   'checked off', 'Sunscreen on everyone', now() - interval '2 minutes'),
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000008',
   'confirmed', 'Old Ebbitt Grill', now() - interval '18 minutes'),
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000002',
   'added', 'The Wharf dinner to Day 4', now() - interval '1 hour'),
  ('11111111-1111-4111-8111-111111111111', null,
   'suggestion accepted', 'Mount Vernon Inn lunch', now() - interval '2 hours');

commit;
