'use client';
import type {Atlas,Specimen} from '@/lib/atlas';
import type {SourceGroup} from '@/lib/source-index';
export default function SourceCatalogue({group,data,onOpen,onFamily}:{group:SourceGroup;data:Atlas;onOpen:(record:Specimen)=>void;onFamily:(id:string)=>void}){
 return <><div className="catalogue-breadcrumb">来源目录 / {group.source}</div><h1>{group.source}</h1>
 <p>范围仅为当前筛选结果已关联的主库来源，不代表全部3999来源实体或全部来源快照。参考关系不计入实际来源。</p>
 <p>{group.sourceCount} 来源记录入口 · {group.entries.length} 来源关联 · {group.recordCount} 去重主库记录；不是独立实物数量。</p>
 <div className="source-record-list">{group.entries.map(({source,specimen:s,relation})=><article key={source.id+'|'+s.id}>
  <button className="source-thumb" onClick={()=>onOpen(s)} aria-label={`打开记录 ${s.id}`}><img src={s.images[0]?.path} loading="lazy" alt=""/></button>
  <div><strong>{source.provider} · {source.identityStatus==='resolved'?source.recordKey:'原始编号待解析'}</strong>
   <p>{s.title}</p><small>主库记录 ID：{s.id} · 关系：{relation}</small>
   {source.identityStatus!=='resolved'&&<p>保留原始链接和标签，未推断编号：{source.labels.join(' / ')}</p>}
   <p>来源分类路径：{source.paths.length?source.paths.map(path=>path.map(n=>`${n.title} [${n.categoryId}]`).join(' › ')).join(' / '):'未记录'}</p>
   <div className="source-record-actions"><button className="text-button" onClick={()=>onOpen(s)}>图片详情</button><button className="text-button" onClick={()=>onFamily(s.familyId)}>Atlas → {data.families.find(f=>f.id===s.familyId)?.title||s.familyId}</button>{source.urls.map(url=><a className="out-link" key={url} href={url} target="_blank" rel="noreferrer">原始来源页面 ↗</a>)}</div>
  </div>
 </article>)}</div></>;
}
