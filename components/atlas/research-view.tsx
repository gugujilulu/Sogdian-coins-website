'use client';
import type {Atlas} from '@/lib/atlas';
import type {MapRange} from '@/lib/map-layers';
import {countLabel} from '@/lib/i18n';
import ArtIcon from '@/components/visual/ArtIcon';
import {useCopy,useLanguage} from './language';
import {serializeLink} from '@/lib/deep-links';
export default function ResearchView({data,imageCount,sources,ranges=[]}:{data:Atlas;imageCount:number;sources:string[];ranges?:MapRange[]}){
 const tr=useCopy(),{locale}=useLanguage();
 const references=Array.from(data.families.flatMap(f=>f.publications).reduce((m,p)=>{if(!m.has(p.url))m.set(p.url,p);return m},new Map<string,Atlas['families'][number]['publications'][number]>()).values());
 const publications=references.filter(p=>!p.url.includes('zeno.ru')&&!p.url.includes('auctions.'));
 const original=references.filter(p=>p.url.includes('zeno.ru')||p.url.includes('auctions.'));
 const rangeSources=Array.from(new Set(ranges.filter(r=>r.geometry).map(r=>r.source)));
 const mapLinks=Array.from(new Map(rangeSources.flatMap(source=>Array.from(source.matchAll(/https?:\/\/[^\s;]+/g),m=>({url:m[0],title:source.slice(0,m.index).trim().split('\n').at(-1)||tr('来源')}))).filter(p=>!references.some(r=>r.url===p.url)).map(p=>[p.url,p])).values());
 const sections=[['记录分类','资料分类说明'],['图片署名','图片方法说明'],['年代','年代方法说明'],['地点','地点方法说明'],['历史范围','范围方法说明'],['来源快照','资料覆盖说明']] as const;
 const referenceLink=(p:{url:string;title:string})=><a key={p.url} href={p.url} target="_blank" rel="noreferrer">{p.title}<ArtIcon name="external" collection="r3" size={16}/></a>;
 const links=(entries:{url:string;title:string}[],limit=3)=><>{entries.slice(0,limit).map(referenceLink)}{entries.length>limit&&<details><summary>{tr('更多资料')}</summary>{entries.slice(limit).map(referenceLink)}</details>}</>;
 return <section className="research-page art-research"><div className="research-hero"><ArtIcon name="rosette" collection="r3" size={45}/><h1>{tr('Research')}</h1><p>{tr('研究页面导语')}</p></div>
 <h2>{tr('主要参考资料')}</h2><div className="research-reference-cards">
 <article><ArtIcon name="book" collection="r3" size={38}/><h3>{tr('钱币目录与研究')}</h3><p className="reference-purpose">{tr('参考目录用途')}</p>{links(publications)}</article>
 <article><ArtIcon name="archive" collection="r3" size={38}/><h3>{tr('原始来源')}</h3><p className="reference-purpose">{tr('参考来源用途')}</p>{links(original)}</article>
 <article><ArtIcon name="range" collection="r3" size={38}/><h3>{tr('历史地图与地域')}</h3><p className="reference-purpose">{tr('参考地理用途')}</p>{links(mapLinks,2)}</article>
 </div>
 <div className="research-access"><a href={serializeLink({view:'catalogue',panel:'sources'})}>{tr('来源索引')}<ArtIcon name="external" collection="r3" size={16}/></a><a href={serializeLink({view:'catalogue',panel:'related'})}>{tr('相关资料图库')}<ArtIcon name="external" collection="r3" size={16}/></a></div>
 <h2>{tr('后续建设')}</h2><div className="research-roadmap">{([
 ['families','近期完善',['用户体验完善','文案与三语完善','上线与使用反馈']],
 ['document','二期建设',['二期范围补充','二期类型关系','二期铭文研究','二期文献关联']]
 ] as const).map(([icon,title,items])=><article key={title}><ArtIcon name={icon} collection="r3" size={35}/><h3>{tr(title)}</h3><ul>{items.map(item=><li key={item}>{tr(item)}</li>)}</ul></article>)}</div>
 <section className="research-learning"><h2>{tr('研究与学习')}</h2><p>{tr('研究功能后续说明')}</p></section>
 <details id="sources-methods" className="research-methods"><summary>{tr('来源与方法')}</summary>{sections.map(([heading,body])=><details key={body}><summary>{tr(heading)}</summary><p>{tr(body)}</p></details>)}
 <details><summary>{tr('文献原始说明')}</summary>{references.map(p=><div key={p.url}>{referenceLink(p)}<p>{p.role}</p></div>)}</details>
 <details><summary>{tr('范围来源记录')}</summary>{rangeSources.map(source=><p key={source}>{source.split(/(https?:\/\/[^\s]+)/).map((part,i)=>/^https?:/.test(part)?<a key={i} href={part} target="_blank" rel="noreferrer">{tr('来源')} ↗</a>:<span key={i}>{part}</span>)}</p>)}</details>
 <details><summary>{tr('当前版本与覆盖')}</summary><p>{countLabel(data.families.length,'families',locale)} · {countLabel(data.variants.length,'groups',locale)} · {countLabel(data.specimens.length,'records',locale)} · {countLabel(imageCount,'images',locale)} · {countLabel(data.relatedRecords.length,'records',locale)} {tr('相关资料')} · {sources.length} {tr('来源系统')}</p>
 <div className="coverage-table"><table><thead><tr><th>{tr('收录范围')}</th><th>{tr('来源')}</th><th>{tr('观察数量')}</th></tr></thead><tbody>{data.scopeCensus.map((c,i)=><tr key={c.categoryId+'|'+i}><td>{c.title}</td><td><a href={c.url} target="_blank" rel="noreferrer">Zeno #{c.categoryId}</a></td><td>{c.sourcePhotoCount}</td></tr>)}</tbody></table></div><p>{tr('快照覆盖',{imported:data.coverage.importedZenoRecords,total:data.coverage.zenoRecordCount??tr('未记录'),images:data.coverage.images})}</p>
 <h3>{tr('主要来源分布')}</h3><p>{tr('主要来源计数说明')}</p>{Array.from(data.specimens.reduce((m,s)=>{const name=s.sourceName||s.sources[0]?.label||tr('未记录');m.set(name,(m.get(name)||0)+1);return m},new Map<string,number>())).map(([name,n])=><p key={name}>{name} · {countLabel(n,'records',locale)}</p>)}
 </details></details><footer className="research-footer"><ArtIcon name="rosette" collection="r3" size={32}/><span>Sogdian Coin Atlas</span></footer></section>;
}
