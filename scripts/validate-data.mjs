import fs from 'node:fs';
import path from 'node:path';
const dir = new URL('../data/', import.meta.url);
const read = f => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'));
const geoFiles = ['destinations.geojson','attractions.geojson','businesses.geojson','safety_facilities.geojson'];
const all = {};
for (const f of geoFiles) {
  const g = read(f);
  if (g.type !== 'FeatureCollection' || !Array.isArray(g.features)) throw new Error(`${f}: invalid FeatureCollection`);
  for (const feature of g.features) {
    if (feature.type !== 'Feature' || feature.geometry?.type !== 'Point') throw new Error(`${f}: invalid Point feature`);
    const c = feature.geometry.coordinates;
    if (!Array.isArray(c) || c.length !== 2 || !Number.isFinite(c[0]) || !Number.isFinite(c[1]) || c[0] < -180 || c[0] > 180 || c[1] < -90 || c[1] > 90) throw new Error(`${f}: invalid [longitude,latitude]`);
  }
  all[f] = g.features;
  console.log(`${f}: ${g.features.length} features OK`);
}
const destIds = new Set(all['destinations.geojson'].map(f => f.properties.id));
for (const f of ['attractions.geojson','businesses.geojson','safety_facilities.geojson']) {
  for (const x of all[f]) if (!destIds.has(x.properties.destination_id)) throw new Error(`${f}: broken destination_id ${x.properties.destination_id}`);
}
const bizIds = new Set(all['businesses.geojson'].map(f => f.properties.id));
const ba = read('business_analytics.json');
for (const x of ba) if (!bizIds.has(x.business_id)) throw new Error(`business_analytics.json: broken business_id ${x.business_id}`);
const it = read('sample_itinerary.json');
for (const x of it.items) if (!Number.isFinite(x.latitude) || !Number.isFinite(x.longitude)) throw new Error(`itinerary item ${x.id}: invalid coordinates`);
for (const f of ['tourism_analytics.json','business_analytics.json']) console.log(`${f}: ${read(f).length} records OK`);
console.log(`sample_itinerary.json: ${it.items.length} items OK`);
console.log('All data validation checks passed.');
