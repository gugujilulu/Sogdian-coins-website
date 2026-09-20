import type {Specimen,SourcePathNode} from './atlas';

export type IndexedSource={id:string;provider:string;recordKey:string;identityStatus:string;urls:string[];labels:string[];paths:SourcePathNode[][]};
export type SourceIndex={version:number;sources:IndexedSource[];links:{recordId:string;sourceId:string;relation:string}[]};
export type SourceEntry={source:IndexedSource;specimen:Specimen;relation:string};
export type SourceGroup={key:string;source:string;entries:SourceEntry[];sourceCount:number;recordCount:number};

/** Project only the T40 result; deduplicate identities and associations, never specimens. */
export function projectSourceIndex(index:SourceIndex,records:readonly Specimen[],query='') {
 const recordsById=new Map(records.map(record=>[record.id,record]));
 const sourcesById=new Map(index.sources.map(source=>[source.id,source]));
 const byRecord=new Map<string,SourceEntry[]>(),bySource=new Map<string,SourceEntry[]>();
 const actual:SourceEntry[]=[],references:SourceEntry[]=[];
 const seen=new Set<string>();
 const q=query.trim().toLowerCase();
 for(const link of index.links){
  const specimen=recordsById.get(link.recordId),source=sourcesById.get(link.sourceId);
  if(!specimen||!source)continue;
  const key=JSON.stringify([link.recordId,link.sourceId,link.relation]);
  if(seen.has(key))continue;seen.add(key);
  const entry={source,specimen,relation:link.relation};
  if(q&&![source.provider,source.recordKey,...source.labels,...source.urls,...source.paths.flatMap(p=>p.map(n=>n.title)),specimen.id,specimen.title,specimen.catalogue].join(' ').toLowerCase().includes(q))continue;
  if(link.relation!=='same_specimen'){references.push(entry);continue}
  actual.push(entry);
  byRecord.set(specimen.id,[...(byRecord.get(specimen.id)||[]),entry]);
  bySource.set(source.id,[...(bySource.get(source.id)||[]),entry]);
 }
 const groups:SourceGroup[]=Array.from(new Set(actual.map(e=>e.source.provider))).sort().map(provider=>{
  const entries=actual.filter(e=>e.source.provider===provider);
  return {key:provider,source:provider,entries,sourceCount:new Set(entries.map(e=>e.source.id)).size,recordCount:new Set(entries.map(e=>e.specimen.id)).size};
 });
 return {groups,byRecord,bySource,references,sourceCount:bySource.size,associationCount:actual.length,recordCount:byRecord.size};
}
