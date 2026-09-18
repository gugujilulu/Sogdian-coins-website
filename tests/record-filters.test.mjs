import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { filterRecords, recordSourceProvider } from '../lib/record-filters.ts';

const data = JSON.parse(readFileSync(new URL('../public/data/atlas.json', import.meta.url)));
const base = data.specimens[0];
const link = (host, relation = 'same_specimen') => ({ url: `https://${host}/record`, label: 'test', relation });
const record = (id, sources, facets, extra = {}) => ({ ...base, id, familyId: 'test-family', sources, facets, ...extra });
const records = [
  record('a', [link('cngcoins.com')], ['Panch tamgha', 'round']),
  record('b', [link('zeno.ru'), link('cngcoins.com', 'comparison')], ['Semi-italic legend']),
  record('c', [link('cngcoins.com')], ['Semi-italic legend', 'Panch tamgha']),
  record('missing', [], [], { variantId: null, sourceName: 'CNG' }),
];
const ids = result => result.records.map(s => s.id);

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
freeze(data); freeze(records);

test('no conditions and clearing return all original records without mutation', () => {
  const before = JSON.stringify(data);
  const all = filterRecords(data.specimens);
  assert.equal(all.recordCount, 1010);
  assert.equal(all.familyIds.size, 56);
  all.records.forEach((s, i) => assert.equal(s, data.specimens[i]));
  assert.deepEqual(ids(filterRecords(data.specimens, { sources: [], inscriptions: [] })), ids(all));
  filterRecords(data.specimens, { sources: ['CNG'], inscriptions: ['absent'] });
  assert.equal(JSON.stringify(data), before);
  assert.equal(filterRecords(data.specimens, {}).recordCount, 1010);
  assert.deepEqual([data.families.length, data.variants.length, data.specimens.length,
    data.specimens.reduce((n, s) => n + s.images.length, 0), data.relatedRecords.length], [56, 120, 1010, 1013, 701]);
  assert.equal(data.coverage.importedZenoRecords, 14);
  assert.equal(data.coverage.zenoRecordCount, 14);
  assert.equal(data.specimens.filter(s => s.familyId === 'lady-nana').reduce((n,s) => n+s.images.length,0),22);
});

test('each dimension uses existing record fields', () => {
  assert.deepEqual(ids(filterRecords(records, { sources: ['CNG'] })), ['a','c']);
  assert.deepEqual(ids(filterRecords(records, { inscriptions: ['Semi-italic legend'] })), ['b','c']);
  assert.deepEqual(ids(filterRecords(records, { tamghas: ['Panch tamgha'] })), ['a','c']);
  assert.deepEqual(ids(filterRecords(records, { features: ['round'] })), ['a']);
  assert.equal(filterRecords(records, { familyIds: ['absent'] }).recordCount, 0);
  assert.deepEqual(ids(filterRecords(records, { catalogueGroupIds: [base.variantId] })), ['a','b','c']);
});

test('AND conditions cannot be satisfied by different records in the same family', () => {
  const filters = { sources: ['CNG'], inscriptions: ['Semi-italic legend'], tamghas: ['Panch tamgha'] };
  assert.deepEqual(ids(filterRecords(records, filters)), ['c']);
  const none = filterRecords(records.slice(0,2), filters);
  assert.equal(none.recordCount, 0);
  assert.equal(none.familyIds.size, 0);
});

test('OR within dimensions, duplicates do not duplicate results; unknown choices return empty', () => {
  assert.deepEqual(ids(filterRecords(records, { sources: ['CNG','Zeno','CNG'] })), ['a','b','c']);
  assert.deepEqual(ids(filterRecords(records, { features: ['round','absent'] })), ['a']);
  assert.equal(filterRecords(records, { sources: ['absent'] }).recordCount, 0);
  assert.equal(filterRecords([records[3]], { sources: ['CNG'] }).recordCount, 0);
  assert.equal(filterRecords([records[3]], { catalogueGroupIds: ['unassigned'] }).recordCount, 0);
});

test('real CNG records only, and secondary actual sources remain searchable', () => {
  assert.deepEqual(ids(filterRecords(data.specimens, { sources: ['CNG'] })), ['cng611-576']);
  assert.deepEqual(ids(filterRecords(data.specimens, { sources: ['Bactrianumis'] })), ['zeno-264408']);
  assert.equal(filterRecords(data.specimens, { sources: ['CNG'], inscriptions: ['Semi-italic legend · 半草书铭文'] }).recordCount, 0);
});

test('comparison/unreviewed links, invalid URLs and provider labels cannot invent sources', () => {
  const s = record('x', [link('cngcoins.com','comparison'),link('zeno.ru','unreviewed')], []);
  assert.equal(filterRecords([s], { sources: ['CNG','Zeno'] }).recordCount, 0);
  assert.equal(recordSourceProvider({url:'invalid',label:'CNG'}), null);
  assert.equal(recordSourceProvider({url:'https://cngcoins.com.evil.test/x',label:'CNG'}), 'cngcoins.com.evil.test');
  assert.equal(recordSourceProvider(link('www.cngcoins.com')), 'CNG');
});

test('editorial facets are excluded and facet dimensions do not substitute for one another', () => {
  const s = record('x', [], ['#503 reviewed','Zeno source group 123','record-level visual review','Panch tamgha']);
  assert.equal(filterRecords([s], { features: ['#503 reviewed','Zeno source group 123','record-level visual review'] }).recordCount, 0);
  assert.equal(filterRecords([s], { inscriptions: ['Panch tamgha'] }).recordCount, 0);
});

test('T40 map families, gallery groups and record counts share one partial-family result', async () => {
  const { filterAtlasRecords } = await import('../lib/record-filters.ts');
  const r = filterAtlasRecords(data, {sources:['CNG'], tamghas:['Panch tamgha · 潘治徽记']});
  assert.deepEqual(ids(r), ['cng611-576']);
  assert.deepEqual(r.families.map(f=>f.id), ['lady-nana']);
  assert.deepEqual(r.recordsByFamily.get('lady-nana'), r.records);
  assert.equal([...r.recordsByFamily.values()].reduce((n,ss)=>n+ss.length,0),r.recordCount);
  const empty = filterAtlasRecords(data,{sources:['CNG'],inscriptions:['Semi-italic legend · 半草书铭文']});
  assert.equal(empty.recordCount,0); assert.equal(empty.families.length,0);
  assert.equal(empty.familyIds.has('lady-nana'),false);
  assert.equal(empty.recordsByFamily.size,0);
  assert.equal(filterAtlasRecords(data).recordCount,1010);
});

test('T40 original family date, region, polity, anchor and status filters still compose', async () => {
  const { filterAtlasRecords } = await import('../lib/record-filters.ts');
  const f = {...data.families[0],id:'test-family',region:'R',polity:'P',status:'S',start:700,end:799,anchor:{placeId:'city'}};
  const fixture = {...data,families:[f],specimens:records};
  for(const year of [700,799]) assert.equal(filterAtlasRecords(fixture,{region:'R',polity:'P',city:'city',status:'S',year,sources:['CNG']}).recordCount,2);
  for(const filters of [{year:699},{year:800},{region:'other'},{polity:'other'},{city:'other'},{status:'other'}]) assert.equal(filterAtlasRecords(fixture,filters).recordCount,0);
  const unknown = {...fixture,families:[{...f,start:null,end:null}]};
  assert.equal(filterAtlasRecords(unknown,{year:750}).recordCount,0);
  assert.equal(filterAtlasRecords(unknown,{year:null}).recordCount,4);
});

test('T40 search and drawer group/facet narrow individual records, not siblings', async () => {
  const { filterAtlasRecords } = await import('../lib/record-filters.ts');
  assert.deepEqual(ids(filterAtlasRecords(data,{query:'cng611-576'})),['cng611-576']); // Present in its existing sourceRecordId.
  const exact = data.specimens.find(s=>s.id==='zeno-264408');
  const found = filterAtlasRecords(data,{query:exact.sourceRecordId || exact.title,sources:['Bactrianumis']});
  assert.deepEqual(ids(found),['zeno-264408']);
  assert.equal(filterAtlasRecords(data,{sources:['CNG'],query:'Semi-italic legend'}).recordCount,0);
  const group = data.specimens.find(s=>s.id==='cng611-576').variantId;
  assert.deepEqual(ids(filterAtlasRecords(data,{sources:['CNG'],catalogueGroupIds:[group]})),['cng611-576']);
  assert.equal(filterAtlasRecords(data,{sources:['CNG'],facet:'absent'}).recordCount,0);
  assert.ok(filterAtlasRecords(data,{unassignedGroup:true}).records.every(s=>s.variantId===null));
});
