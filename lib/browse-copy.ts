import {displayName,tr,formatCopy,copyKnown,countLabel,type Locale} from './i18n.ts';
import type {CatalogueGroup} from './catalogue-tree';
import type {SourceTreeNode} from './source-tree';
/** Display only: raw titles, tree occurrence IDs and search text remain unchanged. */
export function catalogueGroupTitle(group:CatalogueGroup,locale:Locale){return group.group?group.title:tr('未分组（目录归属未明确）',locale)}
export function sourceNodeTitle(node:SourceTreeNode,locale:Locale){
 if(node.kind==='missing')return tr('分类路径未记录',locale);
 if(node.kind==='source'){
  const source=node.entries[0]?.source;
  if(source?.identityStatus!=='resolved')return `${node.provider} · ${tr('编号待解析',locale)} (${source?.labels.join(' / ')||node.title})`;
 }
 return node.title;
}
export function familyTitle(family:{title:string;zh?:string;ru?:string},locale:Locale){return displayName({name:family.title,zh:familySubtitle(family),ru:family.ru},locale)}
/** Search reveals ancestors, without resetting unrelated expansion on display-copy rerenders. */
export function catalogueExpansion(expanded:Set<string>,previous:string,next:string,query:string,ancestors:readonly string[]){return previous!==next&&query.trim()?new Set([...expanded,...ancestors]):expanded}
export function relatedProgress(visible:number,total:number,locale:Locale){return formatCopy('已显示 {visible} / {total} 条相关资料',{visible,total},locale)}

/** Generic import labels are not names; keep them in the data, not the title. */
export function familySubtitle(family:{zh?:string}){return ['目录候选类型','来源目录候选类型','原始标签（中文未记录）'].includes(family.zh||'')?'':family.zh||''}
/** Remove only the known gallery implementation sentence; scholarly claims remain. */
export function familyDescription(text:string,locale:Locale){return copyKnown(text.replace(' The gallery preserves catalogue groupings and individual specimens.',''),locale)}
export function familyCount(shown:number,total:number,images:number,locale:Locale){
 const records=shown===total?countLabel(shown,'records',locale):formatCopy('部分家族记录',{shown,total:countLabel(total,'records',locale)},locale);
 return `${records} · ${countLabel(images,'images',locale)}`;
}
/** Display citation labels only. Author names, titles, URLs and raw evidence stay intact. */
export function referenceTitle(text:string,locale:Locale){
 return text.replace(/第(\d+)图|图(\d+(?:[–—-]\d+)?)/g,(_m,one,span)=>formatCopy('引用图号',{n:one||span},locale))
  .replace(/\b(pp?\.)\s*(\d+(?:[–—-]\d+)?)/g,(_m,label,n)=>locale==='en'?`${label} ${n}`:formatCopy('引用页码',{n},locale))
  .replace(/更新\s*(\d{4})/g,(_m,n)=>formatCopy('引用更新',{n},locale));
}
