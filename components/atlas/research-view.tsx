'use client';
import ResearchCoverage from './research-coverage';
import {copyKnown} from '@/lib/i18n';
import {useEffect,useRef} from 'react';
import type {Atlas} from '@/lib/atlas';
import type {MapRange} from '@/lib/map-layers';
import ArtIcon from '@/components/visual/ArtIcon';
import {useCopy,useLanguage} from './language';
import {referenceTitle} from '@/lib/browse-copy';
import {serializeLink} from '@/lib/deep-links';
const roadmap=[
 ['更多粟特钱币家族','扩充家族、类型与对应钱币资料。','二期'],
 ['拍卖记录','整理钱币拍卖条目与成交记录。','二期'],
 ['比价与销售入口','汇集价格参照与销售平台链接。','二期'],
 ['历史时期政权地图','完善不同历史时期的政权范围与版本，补充年代和来源依据，逐步呈现疆域变化及其与钱币家族的关联。','二期'],
 ['历史地点与考古发现','补充政治中心、铸币地及候选、单枚出土与窖藏资料，关联地点、年代、钱币与来源。','二期'],
 ['钱币流通与地域背景','根据发现记录和研究资料建立钱币流通范围，并扩充相关历史地域背景。','二期'],
 ['学术资源','整理研究文献、数据库与访问链接。','三期'],
 ['徽记研究','汇集徽记图像、释读与关联研究。','三期'],
 ['语言学研究','整理铭文、语言材料与研究入口。','三期']
] as const;
const rosette=()=> <img className="research-rosette" src="/visual/t67-14/row-rosette.webp" alt="" aria-hidden="true"/>;
export default function ResearchView({data,ranges=[],sourceCount}:{data:Atlas;imageCount:number;sources:string[];ranges?:MapRange[];sourceCount?:number}){
 const tr=useCopy(),{locale}=useLanguage();
 const panel=useRef<HTMLDivElement>(null),viewport=useRef<HTMLDivElement>(null),footer=useRef<HTMLImageElement>(null),content=useRef<HTMLDivElement>(null);
 // The mask affects only text. Links outside its clear area cannot be invisible mouse targets.
 useEffect(()=>{
  const root=panel.current,scroll=viewport.current,art=footer.current,body=content.current;if(!root||!scroll||!art||!body)return;
  let frame=0;
  const sync=()=>{const bounds=scroll.getBoundingClientRect(),fade=parseFloat(getComputedStyle(root).getPropertyValue('--research-fade'))||40;for(const node of scroll.querySelectorAll<HTMLElement>('a,summary')){const box=node.getBoundingClientRect();node.style.pointerEvents=box.bottom>bounds.bottom-fade||box.top<bounds.top?'none':''}};
  const measure=()=>{root.style.setProperty('--research-footer-height',`${art.getBoundingClientRect().height}px`);cancelAnimationFrame(frame);frame=requestAnimationFrame(sync)};
  const resize=new ResizeObserver(measure);resize.observe(art);resize.observe(root);resize.observe(body);
  const changes=new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(sync)});changes.observe(body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  scroll.addEventListener('scroll',sync,{passive:true});measure();
  return ()=>{cancelAnimationFrame(frame);resize.disconnect();changes.disconnect();scroll.removeEventListener('scroll',sync)};
 },[]);
 const references=Array.from(data.families.flatMap(f=>f.publications).reduce((m,p)=>{if(!m.has(p.url))m.set(p.url,p);return m},new Map<string,Atlas['families'][number]['publications'][number]>()).values());
 const publications=references.filter(p=>!p.url.includes('zeno.ru')&&!p.url.includes('auctions.'));
 const original=references.filter(p=>p.url.includes('zeno.ru')||p.url.includes('auctions.'));
 const rangeSources=Array.from(new Set(ranges.filter(r=>r.geometry).map(r=>r.source)));
 const mapLinks=Array.from(new Map(rangeSources.flatMap(source=>Array.from(source.matchAll(/https?:\/\/[^\s;]+/g),m=>({url:m[0],title:source.slice(0,m.index).trim().split('\n').at(-1)||tr('来源')}))).filter(p=>!references.some(r=>r.url===p.url)).map(p=>[p.url,p])).values());
 const sections=[['记录分类','资料分类说明'],['图片署名','图片方法说明'],['年代','年代方法说明'],['地点','地点方法说明'],['历史范围','范围方法说明'],['来源快照','资料覆盖说明']] as const;
 const referenceLink=(p:{url:string;title:string;role?:string})=><li key={p.url}><a href={p.url} target="_blank" rel="noreferrer">{referenceTitle(p.title,locale)}<ArtIcon name="external" collection="r3" size={16}/></a>{p.role&&<p>{copyKnown(p.role,locale)}</p>}</li>;
 return <section className="research-page"><div ref={panel} className="catalogue-frame research-frame">
  <img ref={footer} className="research-footer-art" src="/visual/t67-14/footer.webp" alt="" aria-hidden="true"/>
  <div ref={viewport} className="research-scroll" tabIndex={0} aria-label={tr('Research')} onFocusCapture={event=>{const scroll=viewport.current,node=(event.target as HTMLElement).closest<HTMLElement>('a,summary');if(!scroll||!node)return;const box=node.getBoundingClientRect(),bounds=scroll.getBoundingClientRect(),fade=parseFloat(getComputedStyle(panel.current!).getPropertyValue('--research-fade'))||40;if(box.bottom>bounds.bottom-fade||box.top<bounds.top)scroll.scrollTop+=box.top-bounds.top-(scroll.clientHeight-fade-box.height)/2;node.style.pointerEvents=''}}>
   <div ref={content} className="research-content" lang={locale}>
    <h1>{rosette()}{tr('后续建设')}</h1>
    <table className="research-plan"><colgroup><col className="plan-goal"/><col className="plan-description"/><col className="plan-phase"/></colgroup><thead><tr><th scope="col">{tr('规划目标')}</th><th scope="col">{tr('规划说明')}</th><th scope="col" aria-label={tr('开发规划')}><span className="research-desktop-label">{tr('开发规划')}</span><span className="research-mobile-label" aria-hidden="true">{tr('阶段')}</span></th></tr></thead><tbody>{roadmap.map(([goal,description,phase])=><tr key={goal}><th scope="row"><span>{rosette()}<span>{tr(goal)}</span></span></th><td>{tr(description)}</td><td><span className="research-stage" aria-label={tr(phase)}><span className="research-desktop-label">{tr(phase)}</span><span className="research-mobile-label" aria-hidden="true">{phase==='二期'?'II':'III'}</span></span></td></tr>)}</tbody></table>
    <h2>{rosette()}{tr('参考资料与来源')}</h2>
    <div className="research-references">{[
     ['钱币目录与研究','参考目录用途',publications],['原始来源','参考来源用途',original],['历史地图与地域','参考地理用途',mapLinks]
    ].map(([title,purpose,items])=><details key={title as string}><summary>{tr(title as '钱币目录与研究')}</summary><p>{tr(purpose as '参考目录用途')}</p><ul>{(items as {url:string;title:string;role?:string}[]).map(referenceLink)}</ul></details>)}
    <details id="sources-methods"><summary>{tr('来源与方法')}</summary><ResearchCoverage data={data} ranges={ranges} sourceCount={sourceCount}/>{sections.map(([heading,body])=><details key={body}><summary>{tr(heading)}</summary><p>{tr(body)}</p></details>)}<details><summary>{tr('范围来源记录')}</summary>{rangeSources.map(source=><p key={source}>{source.split(/(https?:\/\/[^\s]+)/).map((part,i)=>/^https?:/.test(part)?<a key={i} href={part} target="_blank" rel="noreferrer">{tr('来源')} ↗</a>:<span key={i}>{part}</span>)}</p>)}</details></details>
    </div>
    <div className="research-access"><a href={serializeLink({view:'catalogue',panel:'sources'})}>{tr('来源索引')}<ArtIcon name="external" collection="r3" size={16}/></a><a href={serializeLink({view:'catalogue',panel:'related'})}>{tr('相关资料图库')}<ArtIcon name="external" collection="r3" size={16}/></a></div>
    <div className="research-contact"><h2>{rosette()}{tr('联系邮箱')}</h2><p>{tr("纠错与资料补充")}</p><a href="mailto:zhaoyifu88@gmail.com">zhaoyifu88@gmail.com</a></div>
   </div>
  </div>
 </div></section>;
}
