import {displayName,tr,formatCopy,type Locale} from './i18n.ts';
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
export function familyTitle(family:{title:string;zh?:string;ru?:string},locale:Locale){return displayName({name:family.title,zh:family.zh,ru:family.ru},locale)}
/** Search reveals ancestors, without resetting unrelated expansion on display-copy rerenders. */
export function catalogueExpansion(expanded:Set<string>,previous:string,next:string,query:string,ancestors:readonly string[]){return previous!==next&&query.trim()?new Set([...expanded,...ancestors]):expanded}
export function relatedProgress(visible:number,total:number,locale:Locale){return formatCopy('已显示 {visible} / {total} 条相关资料',{visible,total},locale)}
