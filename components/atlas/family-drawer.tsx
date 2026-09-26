'use client';
import {useEffect,useRef} from 'react';
import {X,MapPin,BookOpen,Maximize2,GitCompareArrows} from 'lucide-react';
import CopyLink from './copy-link';
import type {Family,Specimen,Variant} from '@/lib/atlas';
import type {SourceEntry} from '@/lib/source-index';

type Props={family:Family;placeName:string|null;specimens:Specimen[];allSpecimens:Specimen[];fullSpecimens:Specimen[];variants:Variant[];facets:string[];variant:string;facet:string;setVariant:(x:string)=>void;setFacet:(x:string)=>void;onClose:()=>void;onCatalogue:()=>void;onOpen:(s:Specimen)=>void;onCompare:(id:string)=>void;compareIds:string[];onFullFamily:()=>void;onRestore?:()=>void;onReturnCollection?:()=>void;onLocate?:()=>void;sources:Map<string,SourceEntry[]>;sourceIndexError:boolean};
const images=(records:Specimen[])=>records.reduce((n,r)=>n+r.images.length,0);
export default function FamilyDrawer(p:Props){
 const {family,specimens,allSpecimens,fullSpecimens,variants,variant,facet}=p;
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{scroll.current?.scrollTo({top:0})},[family.id]);
 const activeGroup=variants.find(v=>v.id===variant);
 return <aside className="family-drawer" aria-label={`家族详情 ${family.title}`}>
  <header className="drawer-head family-title"><div><h1>{family.title}</h1>{family.zh&&<p>{family.zh}</p>}</div><button onClick={p.onClose} aria-label="Close details"><X size={20}/></button></header>
  <div ref={scroll} className="drawer-scroll">
   <div className="drawer-secondary"><CopyLink link={{view:'atlas',family:family.id}}/><button onClick={p.onCatalogue}><BookOpen size={14}/>目录</button>{p.onReturnCollection&&<button onClick={p.onReturnCollection}>返回此集合</button>}</div>
   <div className="family-meta"><span>{family.dateLabel||'年代未记录'}</span><span>{family.region||'地区未记录'}</span><span>{family.polity||'政权未记录'}</span><span>{family.status}</span></div>
   <div className="family-location"><MapPin size={14}/><span>{p.placeName||'位置未记录'} · {family.anchor?.role||'位置角色未记录'}</span>{p.onLocate?<button onClick={p.onLocate}>定位</button>:<span>暂无地图定位</span>}</div>
   <div className="gallery-scope"><strong>同类图库 · {specimens.length} 条记录 / {images(specimens)} 张关联图片</strong><small>当前全局匹配：{allSpecimens.length} 条 / {images(allSpecimens)} 张；完整家族：{fullSpecimens.length} 条 / {images(fullSpecimens)} 张。</small><small>图片按匹配记录的全部关联图片计，非某来源专属图片数或独立实物数。</small>
   {p.onRestore?<button onClick={p.onRestore}>返回原筛选结果</button>:specimens.length<fullSpecimens.length&&<><button onClick={p.onFullFamily}>查看完整家族（{fullSpecimens.length} 条 / {images(fullSpecimens)} 张）</button><small>暂时清除全局及家族内筛选；可返回原筛选结果。</small></>}
   </div>
   <div className="drawer-filters"><select aria-label="家族来源／目录组" value={variant} onChange={e=>p.setVariant(e.target.value)}><option value="all">全部来源／目录组</option>{variants.map(v=><option key={v.id} value={v.id}>{v.title} ({allSpecimens.filter(s=>s.variantId===v.id).length})</option>)}{allSpecimens.some(s=>s.variantId===null)&&<option value="unassigned">分组待定</option>}</select>{p.facets.length>0&&<select aria-label="家族铭文／徽记／特征" value={facet} onChange={e=>p.setFacet(e.target.value)}><option value="all">全部铭文 / 徽记 / 特征</option>{p.facets.map(f=><option key={f}>{f}</option>)}</select>}</div>
   <small>来源／目录组不等同于已审定学术 variant。</small>
   <div className="drawer-gallery">{specimens.map(s=><article key={s.id} className="specimen-tile"><button className="specimen-image" onClick={()=>p.onOpen(s)} aria-label={`打开图片 ${s.id}`}>
    {s.images[0]?<img src={s.images[0].path} alt={s.title} loading="lazy" onError={e=>{e.currentTarget.hidden=true}}/>:<small>图片未记录，仍可查看详情</small>}<span><Maximize2 size={12}/>图片详情</span>
   </button><div className="specimen-copy"><strong>{s.title}</strong><small>{s.id} · {s.weightG==null?'重量未记录':`${s.weightG} g`} · {s.diameterMm==null?'直径未记录':`${s.diameterMm} mm`}</small>
   <div className="tile-source-list">{p.sources.get(s.id)?.map(e=><a key={e.source.id} href={e.source.urls[0]} target="_blank" rel="noreferrer">{e.source.provider} · {e.source.recordKey}{e.source.identityStatus!=='resolved'?'（待解析）':''}</a>)||<small>{p.sourceIndexError?'来源索引加载失败；原始来源见详情':'来源索引加载中'}</small>}</div>
   <div className="tile-actions"><button aria-pressed={p.compareIds.includes(s.id)} onClick={()=>p.onCompare(s.id)}><GitCompareArrows size={13}/>{p.compareIds.includes(s.id)?'取消对比':'对比'}</button></div></div></article>)}</div>
   {!specimens.length&&<p role="status">当前家族内筛选没有匹配记录。<button onClick={()=>{p.setVariant('all');p.setFacet('all')}}>清除家族内筛选</button></p>}
   <details className="research-block"><summary>家族说明与研究问题</summary><p>{family.description}</p>{family.question&&<div className="question-note">{family.question}</div>}{family.anchor&&<p>{family.anchor.note}</p>}</details>
   {activeGroup&&<details className="research-block"><summary>目录组说明 · {activeGroup.title}</summary><p>{activeGroup.status} · {activeGroup.reference}</p><p>{activeGroup.description}</p></details>}
   <details className="research-block"><summary>铭文、文献与来源</summary>{family.legend&&<><h3>铭文 / Inscription</h3><p className="inscription">{family.legend}</p><p>{family.legendNote}</p></>}{family.publications.map(pub=><div className="publication" key={pub.url}><a href={pub.url} target="_blank" rel="noreferrer">{pub.title}</a><small>{pub.role}</small></div>)}</details>
  </div>
 </aside>
}
