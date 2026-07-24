-- Add a maps-searchable place to activities, powering a "Map" link on each
-- attraction (tap the pin → the address opens in the traveler's Maps app).
-- Nullable: flights, transit, and unscheduled rest have no fixed place.

alter table public.activities
  add column if not exists map_query text;

-- Backfill the seeded DC 2026 trip so the live itinerary gets map links without
-- a re-seed. Keyed by (day_id, position) — the stable identity of each seeded
-- stop. Fresh databases get the same values inline from supabase/seed.sql.
update public.activities a
set map_query = v.map_query
from (
  values
    -- Day 1 · Arrival & Settle In
    ('dddddddd-0000-4000-8000-000000000001'::uuid, 2,
     'Residence Inn Washington DC Downtown, 1199 Vermont Ave NW, Washington, DC 20005'),
    ('dddddddd-0000-4000-8000-000000000001'::uuid, 3,
     'The White House, 1600 Pennsylvania Ave NW, Washington, DC 20500'),
    -- Day 2 · Capitol Tour + Ford’s Theatre
    ('dddddddd-0000-4000-8000-000000000002'::uuid, 0,
     'Hart Senate Office Building, 120 Constitution Ave NE, Washington, DC 20510'),
    ('dddddddd-0000-4000-8000-000000000002'::uuid, 1,
     'Ford’s Theatre, 511 10th St NW, Washington, DC 20004'),
    ('dddddddd-0000-4000-8000-000000000002'::uuid, 2,
     'Residence Inn Washington DC Downtown, 1199 Vermont Ave NW, Washington, DC 20005'),
    -- Day 3 · Mount Vernon
    ('dddddddd-0000-4000-8000-000000000003'::uuid, 0,
     'George Washington’s Mount Vernon, 3200 Mount Vernon Memorial Hwy, Mount Vernon, VA 22121'),
    ('dddddddd-0000-4000-8000-000000000003'::uuid, 4,
     'Mount Vernon Inn Restaurant, 3200 Mount Vernon Memorial Hwy, Mount Vernon, VA 22121'),
    -- Day 4 · Museum of the Bible (one pin on the flagship Dead Sea Scrolls
    -- exhibit; Megiddo Mosaic and All Creation Sings are inside the same museum)
    ('dddddddd-0000-4000-8000-000000000004'::uuid, 0,
     'Museum of the Bible, 400 4th St SW, Washington, DC 20024'),
    ('dddddddd-0000-4000-8000-000000000004'::uuid, 3,
     'The Wharf, 760 Maine Ave SW, Washington, DC 20024'),
    -- Day 5 · Rest Day + Monument Walk
    ('dddddddd-0000-4000-8000-000000000005'::uuid, 1,
     'National Air and Space Museum, 600 Independence Ave SW, Washington, DC 20560'),
    ('dddddddd-0000-4000-8000-000000000005'::uuid, 2,
     'Founding Farmers DC, 1924 Pennsylvania Ave NW, Washington, DC 20006'),
    ('dddddddd-0000-4000-8000-000000000005'::uuid, 3,
     'Washington Monument, 2 15th St NW, Washington, DC 20024'),
    ('dddddddd-0000-4000-8000-000000000005'::uuid, 4,
     'Lincoln Memorial Reflecting Pool, Washington, DC 20565'),
    -- Day 6 · Worship + Holocaust Museum
    ('dddddddd-0000-4000-8000-000000000006'::uuid, 0,
     'Capitol Hill Baptist Church, 525 A St NE, Washington, DC 20002'),
    ('dddddddd-0000-4000-8000-000000000006'::uuid, 1,
     'United States Holocaust Memorial Museum, 100 Raoul Wallenberg Pl SW, Washington, DC 20024'),
    -- Day 7 · Museum of American History
    ('dddddddd-0000-4000-8000-000000000007'::uuid, 0,
     'National Museum of American History, 1300 Constitution Ave NW, Washington, DC 20560'),
    ('dddddddd-0000-4000-8000-000000000007'::uuid, 1,
     'National Museum of the American Indian, 4th St SW & Independence Ave SW, Washington, DC 20560'),
    ('dddddddd-0000-4000-8000-000000000007'::uuid, 2,
     'National Portrait Gallery, 8th St NW & G St NW, Washington, DC 20001'),
    -- Day 8 · National Archives + Dinner
    ('dddddddd-0000-4000-8000-000000000008'::uuid, 0,
     'National Archives Museum, 701 Constitution Ave NW, Washington, DC 20408'),
    ('dddddddd-0000-4000-8000-000000000008'::uuid, 1,
     'Old Ebbitt Grill, 675 15th St NW, Washington, DC 20005'),
    -- Day 9 · Departure Day
    ('dddddddd-0000-4000-8000-000000000009'::uuid, 0,
     'Residence Inn Washington DC Downtown, 1199 Vermont Ave NW, Washington, DC 20005')
) as v(day_id, position, map_query)
where a.day_id = v.day_id and a.position = v.position;
