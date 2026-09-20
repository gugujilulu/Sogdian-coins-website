import type {Atlas,Family,Specimen,Variant} from './atlas';
import type {SourceEntry} from './source-index';

export type CatalogueRecord={id:string;record:Specimen;sources:SourceEntry[]};
export type CatalogueGroup={id:string;group:Variant|null;title:string;records:CatalogueRecord[];recordCount:number};
export type CatalogueFamily={id:string;family:Family;groups:CatalogueGroup[];recordCount:number};
export type CatalogueTree={families:CatalogueFamily[];recordCount:number;groupCount:number;unassignedCount:number};

/** Existing editorial families (T06 keys) and source/catalogue groups, not academic variants.
 * The input records are the T40 result; each ID appears once, irrespective of source count.
 */
export function buildCatalogueTree(data:Atlas,records:readonly Specimen[],sources:Map<string,SourceEntry[]>,query=''):CatalogueTree {
 const q=query.trim().toLowerCase();
 const unique=new Map(records.map(record=>[record.id,record]));
 const families:CatalogueFamily[]=[];
 for(const family of data.families){
  const groups:CatalogueGroup[]=[];
  const known=data.variants.filter(group=>group.familyId===family.id);
  const ids=new Set(known.map(group=>group.id));
  for(const group of [...known,null]){
   const entries:CatalogueRecord[]=[];
   for(const record of unique.values()){
    if(record.familyId!==family.id)continue;
    if(group?record.variantId!==group.id:record.variantId!==null&&ids.has(record.variantId))continue;
    const actual=(sources.get(record.id)||[]).filter(entry=>entry.relation==='same_specimen');
    const title=group?.title||'未分组（目录归属未明确）';
    const text=[family.title,family.zh,family.region||'未明确',family.polity||'未明确',title,group?.reference||'',record.id,record.title,...actual.flatMap(entry=>[entry.source.provider,entry.source.recordKey,...entry.source.labels])].join(' ').toLowerCase();
    if(q&&!text.includes(q))continue;
    entries.push({id:record.id,record,sources:actual});
   }
   if(entries.length)groups.push({id:group?`catalogue-group:${group.id}`:`unassigned:${family.id}`,group,title:group?.title||'未分组（目录归属未明确）',records:entries,recordCount:entries.length});
  }
  if(groups.length)families.push({id:`taxonomy:family:${family.id}`,family,groups,recordCount:groups.reduce((n,g)=>n+g.recordCount,0)});
 }
 return {families,recordCount:families.reduce((n,f)=>n+f.recordCount,0),groupCount:families.reduce((n,f)=>n+f.groups.filter(g=>g.group).length,0),unassignedCount:families.reduce((n,f)=>n+f.groups.filter(g=>!g.group).reduce((m,g)=>m+g.recordCount,0),0)};
}

const escape=(value:string)=>value.replace(/[\\`*_\[\]<>#|]/g,'\\$&').replace(/[\r\n]+/g,' ');
export function renderCatalogueMarkdown(tree:CatalogueTree):string {
 const lines=['# Atlas 钱币纲目','', '由 lib/catalogue-tree.ts 的同一规范化树生成；全量主库，不受页面临时筛选影响。', '',
  '离线重建（Node 24，复用项目环境）：`node scripts/generate-atlas-catalogue.mjs`。不联网，不重新导出研究数据库。', '',
  '家族沿用 T06 编辑家族身份；major type / variant 尚未审定，不填造节点。来源/目录组不是已审定学术 variant；未分组只是浏览入口。统计单位为主库记录，不是独立实物；相关资料独立展示。', '',
  `${tree.families.length} 家族 / ${tree.groupCount} 来源或目录组 / ${tree.recordCount} 主库记录；其中 ${tree.unassignedCount} 条未分组。`, ''];
 for(const node of tree.families){
  lines.push(`## ${escape(node.family.title)} — ${node.recordCount} 条`, '', `家族 ID：\`${node.family.id}\`；T06：\`${node.id}\`。地域：${escape(node.family.region||'未明确')}；政权：${escape(node.family.polity||'未明确')}。`, '');
  for(const group of node.groups){
   lines.push(`### ${escape(group.title)} — ${group.recordCount} 条`, '', `目录组 ID：\`${group.group?.id||group.id}\`。`, '');
   for(const item of group.records){
    const sources=item.sources.map(({source})=>`${source.provider} · ${source.identityStatus==='resolved'?source.recordKey:'编号待解析'}`).join('；');
    lines.push(`- \`${item.id}\` — ${escape(item.record.title)}；实际来源：${escape(sources||'未记录')}。`);
   }
   lines.push('');
  }
 }
 return lines.join('\n')+'\n';
}
