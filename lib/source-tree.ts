import type {SourceEntry} from './source-index';
export type SourceTreeNode={id:string;entityId:string;provider:string;categoryId:string|null;kind:'provider'|'category'|'missing'|'source';title:string;children:SourceTreeNode[];entries:SourceEntry[];sourceCount:number;associationCount:number;recordCount:number};
export function buildSourceTree(entries:readonly SourceEntry[],query=''){
 const roots:SourceTreeNode[]=[],nodes=new Map<string,SourceTreeNode>();
 const q=query.trim().toLowerCase();
 const create=(id:string,entityId:string,provider:string,categoryId:string|null,kind:SourceTreeNode['kind'],title:string,parent?:SourceTreeNode)=>{
  let node=nodes.get(id);if(!node){node={id,entityId,provider,categoryId,kind,title,children:[],entries:[],sourceCount:0,associationCount:0,recordCount:0};nodes.set(id,node);(parent?parent.children:roots).push(node)}return node;
 };
 for(const entry of entries){
  if(entry.relation!=='same_specimen')continue;
  const source=entry.source;
  for(const path of source.paths.length?source.paths:[[]]){
   if(q&&![source.provider,source.recordKey,...source.labels,entry.specimen.id,entry.specimen.title,...path.map(p=>p.title),...path.map(p=>p.categoryId)].join(' ').toLowerCase().includes(q))continue;
   const keys:string[]=[source.provider];
   let node=create(JSON.stringify(keys),JSON.stringify(keys),source.provider,null,'provider',source.provider);
   const ancestors=[node];
   if(!path.length){keys.push('missing-path');node=create(JSON.stringify(keys),JSON.stringify([source.provider,'missing-path']),source.provider,null,'missing','分类路径未记录',node);ancestors.push(node)}
   for(const part of path){keys.push('category:'+part.categoryId);node=create(JSON.stringify(keys),JSON.stringify([source.provider,part.categoryId]),source.provider,part.categoryId,'category',part.title,node);ancestors.push(node)}
   keys.push('source:'+source.id);
   node=create(JSON.stringify(keys),source.id,source.provider,null,'source',`${source.provider} · ${source.identityStatus==='resolved'?source.recordKey:'编号待解析（'+source.labels.join(' / ')+'）'}`,node);ancestors.push(node);
   for(const ancestor of ancestors)if(!ancestor.entries.some(e=>e.source.id===source.id&&e.specimen.id===entry.specimen.id))ancestor.entries.push(entry);
  }
 }
 for(const node of nodes.values()){node.sourceCount=new Set(node.entries.map(e=>e.source.id)).size;node.recordCount=new Set(node.entries.map(e=>e.specimen.id)).size;node.associationCount=node.entries.length}
 const all=roots.flatMap(n=>n.entries);
 return {roots,nodes,sourceCount:new Set(all.map(e=>e.source.id)).size,associationCount:new Set(all.map(e=>JSON.stringify([e.source.id,e.specimen.id]))).size,recordCount:new Set(all.map(e=>e.specimen.id)).size};
}
export type SourceCoverage={provider:string;categoryId:string;date:string;count?:number;unit?:string;note:string;evidence:string};
export function coverageFor(node:SourceTreeNode,coverage:readonly SourceCoverage[]){return coverage.filter(c=>node.kind==='category'&&c.provider===node.provider&&c.categoryId===node.categoryId)}
