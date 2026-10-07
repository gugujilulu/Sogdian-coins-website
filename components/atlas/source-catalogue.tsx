'use client';
import {useCopy,useLanguage} from './language';
import {countLabel,copyKnown} from '@/lib/i18n';
import ArtIcon from '@/components/visual/ArtIcon';
import BrowseCoinImage from '@/components/visual/BrowseCoinImage';
import type {Atlas,Specimen} from '@/lib/atlas';
import type {SourceGroup} from '@/lib/source-index';
export default function SourceCatalogue({group,data,onOpen,onFamily}:{group:SourceGroup;data:Atlas;onOpen:(record:Specimen)=>void;onFamily:(id:string)=>void}){
 const tr=useCopy();const {locale}=useLanguage();
 return <div className="source-browse-content"><header className="source-browse-heading"><h1><ArtIcon name="archive" collection="r3" size={30}/>{copyKnown(group.source,locale)}</h1><p className="browse-count">{countLabel(group.sourceCount,'sources',locale)} · {countLabel(group.recordCount,'records',locale)}</p><p>{tr("浏览原始来源与关联钱币")}</p></header>
 <div className="source-record-list">{group.entries.map(({source,specimen:s,relation})=><article className="browse-card" key={source.id+'|'+s.id}>
  <button className="browse-image" onClick={()=>onOpen(s)} aria-label={tr("打开记录 {id}",{id:s.id})}><BrowseCoinImage key={s.images[0]?.id||s.id} path={s.images[0]?.path} title={s.title}/></button>
  <div className="browse-card-copy"><strong>{source.provider} · {source.identityStatus==='resolved'?source.recordKey:tr("编号待解析")}</strong><p className="browse-measure">{[s.weightG!=null?`${s.weightG} g`:null,s.diameterMm!=null?`${s.diameterMm} mm`:null].filter(Boolean).join(" · ")}</p>
   <div className="browse-source-links">{source.urls.map(url=><a key={url} href={url} target="_blank" rel="noreferrer">{tr("打开原始记录")}<ArtIcon name="external" collection="r3" size={15}/></a>)}<button onClick={()=>onFamily(s.familyId)}>Atlas → {data.families.find(f=>f.id===s.familyId)?.title||s.familyId}</button></div>
   <details className="browse-notes"><summary>{tr("资料与方法")}</summary><p>{s.title}</p><small>{tr("主库记录 ID")}：{s.id} · {tr("关系")}：{copyKnown(relation,locale)}</small>{source.identityStatus!=='resolved'&&<p>{tr("原始标签")}：{source.labels.join(' / ')}</p>}<p>{tr("来源分类路径")}：{source.paths.length?source.paths.map(path=>path.map(n=>`${n.title} [${n.categoryId}]`).join(' › ')).join(' / '):tr("未记录")}</p>{s.images[0]?.credit&&<p>{tr("图片署名")}：{s.images[0].credit}</p>}</details>
  </div>
 </article>)}</div><details className="browse-notes"><summary>{tr("计数说明")}</summary><p>{countLabel(group.entries.length,'associations',locale)}</p><p>{tr("范围仅为当前筛选结果已关联的主库来源，不代表全部3999来源实体或全部来源快照。参考关系不计入实际来源。")}</p></details></div>;
}
