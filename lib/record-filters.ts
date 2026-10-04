import type { Specimen, SourceLink } from './atlas';

export type RecordFilters = {
  familyIds?: readonly string[];
  /** Existing source/catalogue group IDs, NOT accepted taxonomy variants. */
  catalogueGroupIds?: readonly string[];
  sources?: readonly string[];
  inscriptions?: readonly string[];
  tamghas?: readonly string[];
  features?: readonly string[];
};

// Same domain/provider vocabulary as scripts/source_identity.py. This only labels
// existing links for filtering; it does not generate or rewrite source identities.
const providers: Readonly<Record<string, string>> = {
  'zeno.ru': 'Zeno', 'cngcoins.com': 'CNG', 'numista.com': 'Numista',
  'sogdcoins.narod.ru': 'Coins of Central Asia',
  'sogdcoins.ancients.info': 'Coins of Central Asia',
  'bactrianumis.com': 'Bactrianumis', 'sixbid.com': 'Sixbid',
  'numisbids.com': 'NumisBids', 'biddr.com': 'Biddr', 'sarc.auction': 'Stephen Album',
};

export function recordSourceProvider(source: SourceLink): string | null {
  try {
    const url = new URL(source.url);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!host) return null;
    return Object.entries(providers).find(([domain]) =>
      host === domain || host.endsWith('.' + domain))?.[1] ?? host;
  } catch {
    return null; // Never infer a provider from a title or a comparison label.
  }
}

/** Existing page facet conventions, without interpreting new scholarly features. */
export function recordFacetKind(value: string): 'inscription' | 'tamgha' | 'feature' | null {
  if (value.startsWith('#503') || value.startsWith('Zeno source group') ||
      /record-level visual review/i.test(value)) return null;
  if (/tamgha|徽记|tamga/i.test(value)) return 'tamgha';
  if (/legend|铭文|inscription|script|转写|translit/i.test(value)) return 'inscription';
  return 'feature';
}

/** AND across dimensions; OR within one dimension; absent/empty selections disable it.
 * Returns original objects in input order and their stable family IDs. recordCount
 * counts source-linked corpus records, never confirmed independent physical coins.
 * Missing values fail active filters. Family legends are NOT specimen observations.
 * Dates, family geography, search and UI wiring are outside this T39 engine.
 */
export function filterRecords(records: readonly Specimen[], filters: RecordFilters = {}) {
  const selected = (values?: readonly string[]) => new Set(values ?? []);
  const family = selected(filters.familyIds), groups = selected(filters.catalogueGroupIds);
  const sources = selected(filters.sources), inscriptions = selected(filters.inscriptions);
  const tamghas = selected(filters.tamghas), features = selected(filters.features);
  const matches = (choices: ReadonlySet<string>, values: readonly string[]) =>
    choices.size === 0 || values.some(value => choices.has(value));
  const matched = records.filter(record => {
    const facets = record.facets ?? [];
    return matches(family, [record.familyId]) &&
      matches(groups, record.variantId == null ? [] : [record.variantId]) &&
      matches(sources, (record.sources ?? []).filter(s => s.relation === 'same_specimen')
        .map(recordSourceProvider).filter((s): s is string => s !== null)) &&
      matches(inscriptions, facets.filter(f => recordFacetKind(f) === 'inscription')) &&
      matches(tamghas, facets.filter(f => recordFacetKind(f) === 'tamgha')) &&
      matches(features, facets.filter(f => recordFacetKind(f) === 'feature'));
  });
  return { records: matched, recordCount: matched.length,
    familyIds: new Set(matched.map(record => record.familyId)) };
}

export type DateFilter = { mode: 'all' } | { mode: 'year'; year: number } | { mode: 'unknown' };

/** Family-level filtering evidence only; never an independent specimen dating. */
export function dateRangeStatus(start: number | null | undefined, end: number | null | undefined): 'known' | 'missing' | 'invalid' {
  if ((start != null && !Number.isFinite(start)) || (end != null && !Number.isFinite(end))) return 'invalid';
  if (start == null || end == null) return 'missing';
  return start <= end ? 'known' : 'invalid';
}

export type AtlasFilters = RecordFilters & {
  /** T20 derived metadata projection; absent disables geography, empty Set means zero results. */
  geographyRecordIds?: ReadonlySet<string>;
  query?: string;
  region?: string;
  polity?: string;
  city?: string;
  status?: string;
  /** Mutually exclusive modes; absent means all periods. */
  date?: DateFilter;
  unassignedGroup?: boolean;
  facet?: string;
};

/** One result for map entries, galleries, search and counts. Family metadata only
 * supplies the existing contextual geography/date/status/search conditions.
 * Record text searches never inspect siblings or other catalogue groups.
 */
export function filterAtlasRecords(data: import('./atlas').Atlas, filters: AtlasFilters = {}) {
  const date = filters.date ?? { mode: 'all' };
  if (date.mode === 'year' && !Number.isFinite(date.year)) throw new RangeError('Filter year must be finite');
  const dateAnomalies = data.families.filter(f => dateRangeStatus(f.start, f.end) === 'invalid')
    .map(f => ({ familyId: f.id, start: f.start, end: f.end, reason: 'Invalid or reversed family date interval' }));
  const familiesById = new Map(data.families.map(f => [f.id, f]));
  const groups = new Map(data.variants.map(g => [g.id, g]));
  const q = filters.query?.trim().toLowerCase() ?? '';
  const candidates = filterRecords(data.specimens, filters).records;
  const records = candidates.filter(s => {
    const f = familiesById.get(s.familyId);
    if (!f) return false;
    if (filters.geographyRecordIds && !filters.geographyRecordIds.has(s.id)) return false;
    if (filters.region && f.region !== filters.region) return false;
    if (filters.polity && f.polity !== filters.polity) return false;
    if (filters.city && f.anchor?.placeId !== filters.city) return false;
    if (filters.status && f.status !== filters.status) return false;
    const rangeStatus = dateRangeStatus(f.start, f.end);
    if (date.mode === 'unknown' && rangeStatus === 'known') return false;
    if (date.mode === 'year' && !(rangeStatus === 'known' && f.start != null && f.end != null &&
        f.start <= date.year && date.year <= f.end)) return false;
    if (filters.unassignedGroup && s.variantId !== null) return false;
    if (filters.facet && !s.facets.includes(filters.facet)) return false;
    if (!q) return true;
    const g = s.variantId ? groups.get(s.variantId) : undefined;
    return [f.title, f.zh, f.region, f.dateLabel, f.description, f.legend ?? '',
      ...(g ? [g.title, g.reference, g.description, ...g.facets] : []),
      s.title, s.catalogue, s.description, s.sourceRecordId ?? '',
      ...(s.sourcePath ?? []).map(p => p.title), ...s.sources.map(src => src.label), ...s.facets]
      .join(' ').toLowerCase().includes(q);
  });
  const familyIds = new Set(records.map(s => s.familyId));
  const recordsByFamily = new Map<string, Specimen[]>();
  for (const s of records) {
    const group = recordsByFamily.get(s.familyId) ?? [];
    group.push(s);
    recordsByFamily.set(s.familyId, group);
  }
  return { records, recordCount: records.length, familyIds, recordsByFamily, dateAnomalies,
    families: data.families.filter(f => familyIds.has(f.id)) };
}

/** UI and restored links use the same adapter into the existing record filter. */
export function contextRecordFilters(context:import('./map-selection').FilterContext):AtlasFilters{
 const choices=(value:string)=>value==='all'?[]:[value];
 return {query:context.query,status:context.statusFilter==='all'?undefined:context.statusFilter,
  familyIds:choices(context.familyFilter),sources:choices(context.sourceFilter),inscriptions:choices(context.inscriptionFilter),tamghas:choices(context.tamghaFilter),features:choices(context.featureFilter),
  date:context.dateMode==='year'?{mode:'year',year:context.year}:{mode:context.dateMode}};
}
