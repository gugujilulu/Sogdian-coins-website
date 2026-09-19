import type { RelatedRecord } from './atlas';

export type RelatedThumbnail = { id: string; path: string; width: number | null; height: number | null; sourceName: string | null; sourceRecordId: string | null; sourceRecordUrl: string | null; sourceUrl: string | null; credit: string | null; rightsStatus: string | null; sourceRightsStatus: string | null; rightsSourceUrl: string | null; rightsNote: string | null };
export const RELATED_PAGE_SIZE = 40;

/** Reject malformed/duplicate identity data; never join by ordering or title. */
export function parseRelatedImageIndex(value: unknown): Map<string, RelatedThumbnail[]> {
  if (!value || typeof value !== 'object' || !('records' in value) || !Array.isArray(value.records)) throw new Error('Invalid related image index');
  const result = new Map<string, RelatedThumbnail[]>();
  for (const row of value.records) {
    if (!row || typeof row !== 'object' || typeof row.relatedRecordId !== 'string' || !Array.isArray(row.images) || result.has(row.relatedRecordId)) throw new Error('Invalid related record identity');
    const images: RelatedThumbnail[] = [];
    for (const im of row.images) {
      if (!im || typeof im.id !== 'string' || typeof im.path !== 'string' || !im.path.startsWith('/coins/') || im.path.includes('..') || images.some(image => image.id === im.id)) throw new Error('Invalid related image');
      const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : null;
      const url = (value: unknown) => { const raw=text(value); if(!raw)return null; try { return ['http:','https:'].includes(new URL(raw).protocol) ? raw : null; } catch { return null; } };
      images.push({id:im.id,path:im.path,width:Number.isFinite(im.width)&&im.width>0?im.width:null,height:Number.isFinite(im.height)&&im.height>0?im.height:null,
        sourceName:text(im.sourceName),sourceRecordId:text(im.sourceRecordId),sourceRecordUrl:url(im.sourceRecordUrl),sourceUrl:url(im.sourceUrl),credit:text(im.credit),rightsStatus:text(im.rightsStatus),sourceRightsStatus:text(im.sourceRightsStatus),rightsSourceUrl:url(im.rightsSourceUrl),rightsNote:text(im.rightsNote)});
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

/** A selected image must belong to the exact related record; never fall back to another image. */
export function relatedImage(index: Map<string, RelatedThumbnail[]> | null, recordId: string, imageId: string | null) {
  return index?.get(recordId)?.find(image => image.id === imageId);
}
