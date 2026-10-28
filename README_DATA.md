# TravelPulse AI — extracted demo data pack

This pack was generated from the uploaded project's existing `src/lib/data/seed-*.ts` files. It preserves their field names and IDs; it does not claim that the demo metrics or contact details are verified real-world data.

## Files and counts
- `destinations.geojson` — 15 destination points
- `attractions.geojson` — 19 attraction points
- `businesses.geojson` — 22 business points
- `safety_facilities.geojson` — 9 safety-facility points
- `sample_itinerary.json` — one 17-item itinerary
- `tourism_analytics.json` — 30 synthetic tourism-analytics records
- `business_analytics.json` — 30 synthetic business-analytics records
- `tourism_summary.json` — derived summary
- `demo_users.json` — three demo profile examples; no passwords or credentials
- `supabase_schema.sql` — optional schema if you want persistent database tables
- `scripts/validate-data.mjs` — validates JSON, GeoJSON coordinates, and foreign-key references

GeoJSON coordinates use `[longitude, latitude]`. The GeoJSON `crs` label uses CRS84, which is WGS84 longitude/latitude order.

## Validation
From the extracted project root, copy this pack's `data/` directory and `scripts/validate-data.mjs` into the project, then run:
`node scripts/validate-data.mjs`

## Important integration note
The current app imports TypeScript seed arrays directly from `src/lib/data/seed-*.ts`. It does not automatically load files from a `data/` folder. To use these files in the UI, either keep the existing TypeScript seeds as the runtime source, or update the relevant imports/data-access layer to load JSON (server-side) or fetch from Supabase. Do not import a private service-role key into client-side code.

## Supabase
1. Create a Supabase project and configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. Run `supabase_schema.sql` in the Supabase SQL Editor.
3. The current project only uses Supabase Auth and `profiles` in its API routes. There is no existing migration or importer for destinations/attractions/businesses/safety/analytics. The schema in this pack is optional and stores each row's complete source object in a `data` JSONB column alongside indexed IDs/coordinates.
4. Never seed real user credentials. `demo_users.json` is sample profile data only and does not create login accounts.

## Caveats
- Coordinates and sample metrics were taken from the existing seed code and have not been independently verified.
- Some image paths in the code (for example `/images/destinations/mahabaleshwar.jpg`) are referenced but the matching image files are not included in the uploaded ZIP.
- Tourism analytics are generated with `Math.random()` at runtime in the source, so the included analytics snapshot is one generated sample and will differ on each fresh run.
- `sample_itinerary.json` is a Mahabaleshwar demo itinerary, not a dynamically generated itinerary for every destination.
