import type { RelatedRecord } from './atlas';

export type RelatedThumbnail = { id: string; path: string; width: number; height: number };
export const RELATED_PAGE_SIZE = 40;

/** Reject malformed/duplicate identity data; never join by ordering or title. */
export function parseRelatedImageIndex(value: unknown): Map<string, RelatedThumbnail[]> {
  if (!value || typeof value !== 'object' || !('records' in value) || !Array.isArray(value.records)) throw new Error('Invalid related image index');
  const result = new Map<string, RelatedThumbnail[]>();
  for (const row of value.records) {
    if (!row || typeof row !== 'object' || typeof row.relatedRecordId !== 'string' || !Array.isArray(row.images) || result.has(row.relatedRecordId)) throw new Error('Invalid related record identity');
    const images: RelatedThumbnail[] = [];
    for (const im of row.images) {
      if (!im || typeof im.id !== 'string' || typeof im.path !== 'string' || !im.path.startsWith('/coins/') || im.path.includes('..') || !Number.isFinite(im.width) || im.width <= 0 || !Number.isFinite(im.height) || im.height <= 0) throw new Error('Invalid related image');
      images.push({id:im.id,path:im.path,width:im.width,height:im.height});
    }
    result.set(row.relatedRecordId, images);
  }
  return result;
}

export function relatedPage(records: readonly RelatedRecord[], query: string, batches = 1) {
  const q = query.trim().toLowerCase();
  const matches = records.filter(r => !q || [r.sourceRecordId,r.title,r.reviewStatus,r.reason,r.leafCategoryTitle,...r.sourcePath.map(x=>x.title)].join(' ').toLowerCase().includes(q));
  return { matches, visible: matches.slice(0, Math.max(1, batches) * RELATED_PAGE_SIZE) };
}

export type RelatedPaging = { query: string; batches: number };

/** Remember every query transition, including a return to a previously used query. */
export function resetRelatedPaging(paging: RelatedPaging, query: string): RelatedPaging {
  return paging.query === query ? paging : { query, batches: 1 };
}
