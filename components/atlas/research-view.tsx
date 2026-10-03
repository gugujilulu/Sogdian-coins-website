'use client';
import type {Atlas} from '@/lib/atlas';
import type {MapRange} from '@/lib/map-layers';
import {countLabel} from '@/lib/i18n';
import ArtIcon from '@/components/visual/ArtIcon';
import {useCopy,useLanguage} from './language';
export default function ResearchView({data,imageCount,sources,ranges=[]}:{data:Atlas;imageCount:number;sources:string[];ranges?:MapRange[]}){
 const tr=useCopy(),{locale}=useLanguage();
 const references=Array.from(new Map(data.families.flatMap(f=>f.publications).map(p=>[p.url,p])).values());
 const publications=references.filter(p=>!p.url.includes('zeno.ru')&&!p.url.includes('auctions.'));
 const original=references.filter(p=>p.url.includes('zeno.ru')||p.url.includes('auctions.'));
 const rangeSources=Array.from(new Set(ranges.filter(r=>r.geometry).map(r=>r.source)));
 const sections=[['记录分类','资料分类说明'],['图片署名','图片方法说明'],['年代','年代方法说明'],['地点','地点方法说明'],['历史范围','范围方法说明'],['来源快照','资料覆盖说明']] as const;
 const links=(entries:typeof references)=><>{entries.slice(0,3).map(p=><a key={p.url} href={p.url} target="_blank" rel="noreferrer">{p.title}<ArtIcon name="external" collection="r3" size={16}/></a>)}{entries.length>3&&<details><summary>{tr('更多资料')}</summary>{entries.slice(3).map(p=><p key={p.url}><a href={p.url} target="_blank" rel="noreferrer">{p.title} ↗</a><small>{p.role}</small></p>)}</details>}</>;
 return <section className="research-page art-research"><div className="research-hero"><ArtIcon name="rosette" collection="r3" size={45}/><span className="eyebrow">{tr('研究资料库')}</span><h1>{tr('Research')}</h1><p>{tr('研究导语')}</p></div>
 <h2>{tr('主要参考资料')}</h2><div className="research-reference-cards">
 <article><ArtIcon name="book" collection="r3" size={38}/><h3>{tr('钱币目录与研究')}</h3>{links(publications)}</article>
 <article><ArtIcon name="archive" collection="r3" size={38}/><h3>{tr('原始来源')}</h3>{links(original)}</article>
 <article><ArtIcon name="range" collection="r3" size={38}/><h3>{tr('历史地图与地域')}</h3><details><summary>{tr('查看资料')}</summary>{rangeSources.map(source=><p key={source}>{source.split(/(https?:\/\/[^\s]+)/).map((part,i)=>/^https?:/.test(part)?<a key={i} href={part} target="_blank" rel="noreferrer">{tr('来源')} ↗</a>:<span key={i}>{part}</span>)}</p>)}</details></article>
 </div>
 <h2>{tr('后续建设')}</h2><div className="research-roadmap">{([['families','范围与钱币建设','范围与钱币规划'],['document','语言铭文徽记','学习规划'],['calendar','拍卖与价格','价格规划']] as const).map(([icon,title,body])=><article key={title}><ArtIcon name={icon} collection="r3" size={35}/><h3>{tr(title)}</h3><p>{tr(body)}</p></article>)}</div>
 <section className="research-learning"><h2>{tr('研究与学习')}</h2><p>{tr('学习待开发')}</p></section>
 <details id="sources-methods" className="research-methods"><summary>{tr('来源与方法')}</summary>{sections.map(([heading,body])=><details key={body}><summary>{tr(heading)}</summary><p>{tr(body)}</p></details>)}
 <details><summary>{tr('当前版本与覆盖')}</summary><p>{countLabel(data.families.length,'families',locale)} · {countLabel(data.variants.length,'groups',locale)} · {countLabel(data.specimens.length,'records',locale)} · {countLabel(imageCount,'images',locale)} · {countLabel(data.relatedRecords.length,'records',locale)} {tr('相关资料')} · {sources.length} {tr('来源系统')}</p>
 <div className="coverage-table"><table><thead><tr><th>{tr('收录范围')}</th><th>{tr('来源')}</th><th>{tr('观察数量')}</th></tr></thead><tbody>{data.scopeCensus.map((c,i)=><tr key={c.categoryId+'|'+i}><td>{c.title}</td><td><a href={c.url} target="_blank" rel="noreferrer">Zeno #{c.categoryId}</a></td><td>{c.sourcePhotoCount}</td></tr>)}</tbody></table></div><p>{tr('快照覆盖',{imported:data.coverage.importedZenoRecords,total:data.coverage.zenoRecordCount??tr('未记录'),images:data.coverage.images})}</p>
 <h3>{tr('主要来源分布')}</h3><p>{tr('主要来源计数说明')}</p>{Array.from(data.specimens.reduce((m,s)=>{const name=s.sourceName||s.sources[0]?.label||tr('未记录');m.set(name,(m.get(name)||0)+1);return m},new Map<string,number>())).map(([name,n])=><p key={name}>{name} · {countLabel(n,'records',locale)}</p>)}
 </details></details><footer className="research-footer"><ArtIcon name="rosette" collection="r3" size={32}/><span>Sogdian Coin Atlas</span></footer></section>;
}
