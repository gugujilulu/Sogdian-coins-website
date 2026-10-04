'use client';
import {useState} from 'react';
import type {Specimen,Family,Variant} from '@/lib/atlas';
import {serializeLink,type DeepLink} from '@/lib/deep-links';
import {selectedImage} from '@/lib/image-viewer';
import {distinctSourceLinks,recordDescription,typeDescription} from '@/lib/detail-presentation';
import {useCopy,useLanguage} from './language';
import {copyKnown} from '@/lib/i18n';
import {familyTitle,familyDescription} from '@/lib/browse-copy';
import DetailDialog from './detail-dialog';
import ImageViewer from './image-viewer';
import ImageProvenance from './image-provenance';
export default function SpecimenDetails({matches,link,specimen,family,group,onClose}:{matches:boolean;link:DeepLink;specimen:Specimen;family:Family|null;group?:Variant;onClose:()=>void}){
 const tr=useCopy(),{locale}=useLanguage();
 const [imageId,setImageId]=useState<string|null>(null),image=selectedImage(specimen.images,imageId);
 const sources=distinctSourceLinks(specimen.sources),description=recordDescription(specimen.description,specimen.sourceRecordId),introduction=familyDescription(typeDescription(family?.description||'',specimen.description),locale);
 const catalogueLink=serializeLink({...link,view:'catalogue',family:specimen.familyId,group:group?`catalogue-group:${group.id}`:`unassigned:${specimen.familyId}`,record:undefined,panel:undefined,node:undefined,related:undefined});
 return <DetailDialog title={tr('主库图片详情')} shareLink={link} nana={family?.id==='lady-nana'} onClose={onClose}>
 <ImageViewer images={specimen.images} imageId={imageId} onSelect={setImageId}/>
 <div className="modal-info">{!matches&&<p role="status">{tr('此记录不符合当前筛选；不计入当前匹配数量。')}</p>}
 <span className="eyebrow">{family? familyTitle(family,locale):null}</span><h1>{specimen.title}</h1>
 <dl className="record-facts">{specimen.weightG!=null&&<div><dt>{tr('重量')}</dt><dd>{specimen.weightG} g</dd></div>}{specimen.diameterMm!=null&&<div><dt>{tr('直径')}</dt><dd>{specimen.diameterMm} mm</dd></div>}{family?.dateLabel&&<div><dt>{tr('家族年代')}</dt><dd>{copyKnown(family.dateLabel,locale)}</dd></div>}</dl>
 {description&&<section className="record-description"><h2>{tr('钱币描述')}</h2><p>{description}</p></section>}
 {family&&(family.legend||introduction)&&<section><h2>{tr('类型介绍')}</h2>{introduction&&<p>{introduction}</p>}{family.legend&&<><h3>{tr('铭文 / Inscription')}</h3><p className="inscription">{family.legend}</p>{family.legendNote&&<p>{copyKnown(family.legendNote,locale)}</p>}</>}</section>}
 <section className="record-catalogue"><h2>{tr('目录归属')}</h2>{(specimen.catalogue||group?.reference)&&<p>{specimen.catalogue||group?.reference}</p>}<a href={catalogueLink}>{tr('在目录中查看')} ↗</a></section>
 <div className="record-source-links">{sources.map(s=><a className="out-link" key={s.url} aria-current={s.url===image?.sourceRecordUrl?'true':undefined} href={s.url} target="_blank" rel="noreferrer">{sources.length===1?tr('原始记录页面'):s.label} ↗{sources.length>1&&s.url===image?.sourceRecordUrl&&<small>{tr('当前图片来源')}</small>}</a>)}</div>
 <ImageProvenance compact image={image} recordUrls={sources.map(s=>s.url)}>
 {family?.description&&familyDescription(family.description,locale)!==family.description&&<details><summary>{tr('类型介绍原文')}</summary><p>{family.description}</p></details>}
 {!!specimen.facets.length&&<><h3>{tr('Inscription / tamgha / features')}</h3><div className="facet-chips">{specimen.facets.map((x,i)=><span key={x+i}>{copyKnown(x,locale)}</span>)}</div></>}
 {specimen.coinRole&&<p>{tr('Coin role')}：{specimen.coinRole}</p>}
 {specimen.findContextClaim&&<p>{tr('Find context')}：{typeof specimen.findContextClaim==='string'?specimen.findContextClaim:[specimen.findContextClaim.rawText,specimen.findContextClaim.note].filter(Boolean).join(' · ')}</p>}
 </ImageProvenance></div></DetailDialog>;
}
