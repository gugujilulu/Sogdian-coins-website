import type {Atlas} from './atlas';
import type {CatalogueTree} from './catalogue-tree';
import type {SourceTreeNode} from './source-tree';
export type DeepLink={view:'atlas'|'catalogue'|'research';family?:string;group?:string;panel?:'sources'|'related'|'references';node?:string;record?:string;related?:string};
const keys=['view','family','group','panel','node','record','related'] as const;
export function serializeLink(link:DeepLink){const p=new URLSearchParams();for(const key of keys)if(link[key])p.set(key,link[key]);return '#'+p.toString()}
export function parseLink(hash:string):DeepLink {
 const raw=hash.replace(/^#/,'');
 try{decodeURIComponent(raw)}catch{throw Error('链接编码无效')}
 const p=new URLSearchParams(raw);
 for(const key of p.keys())if(![...keys,'source'].includes(key as typeof keys[number])||p.getAll(key).length!==1||!p.get(key))throw Error('链接包含无效或重复参数');
 const view=p.get('view')||'atlas';if(!['atlas','catalogue','research'].includes(view))throw Error('不支持的旧视图或 view 参数');
 const link:DeepLink={view:view as DeepLink['view']};
 for(const key of ['family','group','node','record','related'] as const)if(p.has(key))link[key]=p.get(key)!;
 const panel=p.get('panel');if(panel&&!['sources','related','references'].includes(panel))throw Error('无效的目录入口');
 if(panel)link.panel=panel as DeepLink['panel'];
 const old=p.get('source');
 // Legacy source URLs also stored the last Atlas family, which was not source context.
 if(old)delete link.family;
 if(old){if(panel||link.node)throw Error('新旧来源参数冲突');if(old==='__related__')link.panel='related';else if(old==='__references__')link.panel='references';else if(old.startsWith('__'))throw Error('旧来源链接缺少稳定路径，请从来源目录重新复制');else{link.panel='sources';link.node=JSON.stringify([old])}}
 if(link.node){let path:unknown;try{path=JSON.parse(link.node)}catch{throw Error('来源路径格式无效')}
  if(!Array.isArray(path)||!path.length||path.some(x=>typeof x!=='string'||!x)||path.slice(1).some(x=>!x.startsWith('category:')&&!x.startsWith('source:')&&x!=='missing-path'))throw Error('来源路径格式无效');
  link.node=JSON.stringify(path);if(link.panel&&link.panel!=='sources')throw Error('来源路径与入口冲突');link.panel='sources';
 }
 if(link.related){if(link.record||link.family||link.group||link.node||(link.panel&&link.panel!=='related'))throw Error('相关资料与主库命名空间冲突');link.panel='related'}
 if(link.panel&&(link.group||link.family))throw Error('来源与 Atlas 目录上下文冲突');
 if(link.panel||link.group)link.view='catalogue';
 return link;
}
export function validateLink(link:DeepLink,data:Atlas,tree:CatalogueTree,sourceNodes:Map<string,SourceTreeNode>|null,sourceFailed=false):'ready'|'waiting'{
 if(link.family&&!data.families.some(f=>f.id===link.family))throw Error('家族不存在：'+link.family);
 const group=link.group?tree.families.flatMap(f=>f.groups.map(g=>({group:g,family:f.family.id}))).find(g=>g.group.id===link.group):null;
 if(link.group&&!group)throw Error('目录节点不存在：'+link.group);
 if(group&&link.family&&group.family!==link.family)throw Error('目录组与家族不匹配');
 const record=link.record?data.specimens.find(r=>r.id===link.record):null;
 if(link.record&&!record)throw Error('主库记录不存在：'+link.record);
 if(record&&link.family&&record.familyId!==link.family)throw Error('记录与家族不匹配');
 if(record&&group&&!group.group.records.some(r=>r.id===record.id))throw Error('记录与目录组不匹配');
 if(link.related&&!data.relatedRecords.some(r=>r.id===link.related))throw Error('相关资料记录不存在：'+link.related);
 if(link.node){if(sourceFailed)throw Error('所需来源索引加载失败，无法验证目标；请重新加载页面');if(!sourceNodes)return 'waiting';const node=sourceNodes.get(link.node);if(!node)throw Error('来源节点或路径不存在');if(record&&!node.entries.some(e=>e.specimen.id===record.id))throw Error('来源路径与主库记录不匹配')}
 return 'ready';
}
export function ancestorNodes(node:string){const path=JSON.parse(node) as string[];return path.map((_,i)=>JSON.stringify(path.slice(0,i+1)))}
