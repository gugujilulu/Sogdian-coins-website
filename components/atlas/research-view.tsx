'use client';
import type {Atlas} from '@/lib/atlas';
import {countLabel} from '@/lib/i18n';
import {useCopy,useLanguage} from './language';
export default function ResearchView({data,imageCount,sources}:{data:Atlas;imageCount:number;sources:string[]}){
 const tr=useCopy(),{locale}=useLanguage();
 const references=Array.from(new Map(data.families.flatMap(f=>f.publications).map(p=>[p.url,p])).values());
 const sourceCounts=Array.from(data.specimens.reduce((m,s)=>{const key=s.sourceName||s.sources[0]?.label||tr('未记录');m.set(key,(m.get(key)||0)+1);return m},new Map<string,number>()).entries()).sort((a,b)=>b[1]-a[1]);
 const sections=[['记录分类','资料分类说明'],['图片署名','图片方法说明'],['年代','年代方法说明'],['地点','地点方法说明'],['历史范围','范围方法说明'],['来源快照','资料覆盖说明']] as const;
 return <section className="research-page"><div className="research-hero"><span className="eyebrow">{tr('研究资料库')}</span><h1>{tr('项目与资料')}</h1><p>{tr('项目简介')}</p></div>
 <h2>{tr('当前资料')}</h2><div className="metrics-row">{[[data.families.length,'families'],[data.variants.length,'groups'],[data.specimens.length,'records'],[imageCount,'images']] .map(([n,kind])=><div key={kind}><span>{countLabel(n as number,kind as 'families'|'groups'|'records'|'images',locale)}</span></div>)}<div><strong>{sources.length}</strong><span>{tr('来源系统')}</span></div><div><strong>{data.relatedRecords.length}</strong><span>{tr('相关资料记录')}</span></div></div>
 <article id="sources-methods"><h2>{tr('来源与方法')}</h2>{sections.map(([heading,body])=><details key={body}><summary>{tr(heading)}</summary><p>{tr(body)}</p></details>)}</article>
 <details className="research-references"><summary>{tr('主要参考资料')}</summary><div className="research-columns">{references.map(p=><article key={p.url}><a href={p.url} target="_blank" rel="noreferrer">{p.title} ↗</a><p>{p.role}</p></article>)}</div></details>
 <h2>{tr('主要来源分布')}</h2><p>{tr('主要来源计数说明')}</p><div className="source-coverage-grid">{sourceCounts.map(([name,n])=><div key={name}><strong>{n}</strong><span>{name}</span></div>)}</div>
 <h2>{tr('来源快照')}</h2><div className="coverage-table"><table><thead><tr><th>{tr('收录范围')}</th><th>{tr('来源')}</th><th>{tr('观察数量')}</th></tr></thead><tbody>{data.scopeCensus.map((c,i)=><tr key={c.categoryId+'|'+i}><td>{c.title}</td><td><a href={c.url} target="_blank" rel="noreferrer">Zeno #{c.categoryId}</a></td><td>{c.sourcePhotoCount}</td></tr>)}</tbody></table></div><p>{tr('快照覆盖',{imported:data.coverage.importedZenoRecords,total:data.coverage.zenoRecordCount??tr('未记录'),images:data.coverage.images})}</p>
 <h2>{tr('后续建设')}</h2><p>{tr('后续建设说明')}</p></section>;
}
