'use client';
import {useState} from 'react';
import type {Specimen,Family} from '@/lib/atlas';
import type {DeepLink} from '@/lib/deep-links';
import {selectedImage} from '@/lib/image-viewer';
import {copyKnown} from '@/lib/i18n';
import {sourceIdentity} from '@/lib/detail-presentation';
import {useCopy,useLanguage} from './language';
import DetailDialog from './detail-dialog';
import ImageViewer from './image-viewer';
import ImageProvenance from './image-provenance';
export default function SpecimenDetails({matches,link,specimen,family,onClose}:{matches:boolean;link:DeepLink;specimen:Specimen;family:Family|null;onClose:()=>void}){
 const tr=useCopy(),{locale}=useLanguage();
 const [imageId,setImageId]=useState<string|null>(null),image=selectedImage(specimen.images,imageId);
 return <DetailDialog title={tr('主库图片详情')} shareLink={link} nana={family?.id==='lady-nana'} onClose={onClose}>
 <ImageViewer images={specimen.images} imageId={imageId} onSelect={setImageId}/>
 <div className="modal-info">{!matches&&<p role="status">{tr('此记录不符合当前筛选；不计入当前匹配数量。')}</p>}
 <span className="eyebrow">{family?.title}</span><h1>{specimen.title}</h1>
 <dl className="record-facts"><div><dt>{tr('重量')}</dt><dd>{specimen.weightG!=null?`${specimen.weightG} g`:tr('重量未记录')}</dd></div><div><dt>{tr('直径')}</dt><dd>{specimen.diameterMm!=null?`${specimen.diameterMm} mm`:tr('直径未记录')}</dd></div>{family&&<><div><dt>{tr('家族年代')}</dt><dd>{family.dateLabel||tr('年代未记录')}</dd></div><div><dt>{tr('历史地区 / Region')}</dt><dd>{family.region||tr('地区未记录')}</dd></div><div><dt>{tr('政权')}</dt><dd>{family.polity||tr('政权未记录')}</dd></div></>}</dl>
 {specimen.description&&<section className="record-description"><h2>{tr('钱币描述')}</h2><p>{specimen.description}</p></section>}
 <div className="record-source-links">{specimen.sources.map((s,i)=><a className="out-link" key={s.url+i} href={s.url} target="_blank" rel="noreferrer">{specimen.sourceRecordId&&s.label.includes(specimen.sourceRecordId)?tr("原始记录页面"):s.label} ↗</a>)}</div>
 <ImageProvenance compact image={image}/>
 <details className="record-methods"><summary>{tr('资料与方法')}</summary>
 {specimen.sourceRecordId&&!specimen.title.includes(specimen.sourceRecordId)&&<p>{sourceIdentity(specimen.sourceName,specimen.sourceRecordId)}</p>}
 {family?.anchor&&<p>{tr('地点角色')}：{copyKnown(family.anchor.role,locale)}</p>}
 {specimen.catalogue&&<p>{tr('Catalogue')}：{specimen.catalogue}</p>}
 {specimen.coinRole&&<p>{tr('Coin role')}：{specimen.coinRole}</p>}
 {specimen.findContextClaim&&<p>{tr('Find context')}：{typeof specimen.findContextClaim==='string'?specimen.findContextClaim:[specimen.findContextClaim.rawText,specimen.findContextClaim.status,specimen.findContextClaim.note].filter(Boolean).join(' · ')}</p>}
 {!!specimen.sourcePath?.length&&<p>{tr('Source path')}：{specimen.sourcePath.map(x=>x.title).join(' › ')}</p>}
 {!!specimen.facets.length&&<><h3>{tr('Inscription / tamgha / features')}</h3><div className="facet-chips">{specimen.facets.map((x,i)=><span key={x+i}>{x}</span>)}</div></>}
 </details></div></DetailDialog>;
}
