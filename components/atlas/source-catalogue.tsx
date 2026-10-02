'use client';
import {useCopy,useLanguage} from './language';
import {countLabel,copyKnown} from '@/lib/i18n';
import type {Atlas,Specimen} from '@/lib/atlas';
import type {SourceGroup} from '@/lib/source-index';
export default function SourceCatalogue({group,data,onOpen,onFamily}:{group:SourceGroup;data:Atlas;onOpen:(record:Specimen)=>void;onFamily:(id:string)=>void}){
 const tr=useCopy();const {locale}=useLanguage();
 return <><div className="catalogue-breadcrumb">{tr("来源目录")} / {group.source}</div><h1>{group.source}</h1>
 <p>{tr("范围仅为当前筛选结果已关联的主库来源，不代表全部3999来源实体或全部来源快照。参考关系不计入实际来源。")}</p>
 <p>{countLabel(group.sourceCount,'sources',locale)} · {countLabel(group.entries.length,'associations',locale)} · {countLabel(group.recordCount,'records',locale)}</p>
 <div className="source-record-list">{group.entries.map(({source,specimen:s,relation})=><article key={source.id+'|'+s.id}>
  <button className="source-thumb" onClick={()=>onOpen(s)} aria-label={tr("打开记录 {id}",{id:s.id})}><img src={s.images[0]?.path} loading="lazy" alt=""/></button>
  <div><strong>{source.provider} · {source.identityStatus==='resolved'?source.recordKey:tr("编号待解析")}</strong>
   <p>{s.title}</p><small>{tr("主库记录 ID")}：{s.id} · {tr("关系")}：{copyKnown(relation,locale)}</small>
   {source.identityStatus!=='resolved'&&<p>{tr("原始标签")}：{source.labels.join(' / ')}</p>}
   <p>{tr("来源分类路径")}：{source.paths.length?source.paths.map(path=>path.map(n=>`${n.title} [${n.categoryId}]`).join(' › ')).join(' / '):tr("未记录")}</p>
   <div className="source-record-actions"><button className="text-button" onClick={()=>onOpen(s)}>{tr("图片详情")}</button><button className="text-button" onClick={()=>onFamily(s.familyId)}>Atlas → {data.families.find(f=>f.id===s.familyId)?.title||s.familyId}</button>{source.urls.map(url=><a className="out-link" key={url} href={url} target="_blank" rel="noreferrer">{tr("原始来源页面")} ↗</a>)}</div>
  </div>
 </article>)}</div></>;
}
