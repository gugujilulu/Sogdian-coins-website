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
