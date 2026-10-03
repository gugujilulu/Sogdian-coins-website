'use client';
import {useCopy} from './language';
import type {ViewableImage} from './image-viewer';
export type ProvenanceImage=ViewableImage&{sourceName?:string|null;sourceRecordId?:string|null;sourceRecordUrl?:string|null;sourceUrl?:string|null;credit?:string|null;rightsStatus?:string|null;sourceRightsStatus?:string|null;rightsSourceUrl?:string|null;rightsNote?:string|null};
export default function ImageProvenance({image}:{image:ProvenanceImage|undefined}){
 const tr=useCopy();
 if(!image)return <p>{tr("当前图片来源信息：未记录")}</p>;
 const link=(url:string|null|undefined,label:string)=>url?<a className="out-link" href={url} target="_blank" rel="noreferrer">{label} ↗</a>:<span>{label}：{tr("未记录")}</span>;
 return <section aria-label={tr("当前图片来源信息")} data-image-id={image.id}><h3>{tr("当前图片来源")}</h3><p>{tr("来源平台")}：{image.sourceName||tr("未记录")} · {tr("原始记录编号")}：{image.sourceRecordId||tr("未记录 / 待解析")}</p><p>{link(image.sourceRecordUrl,tr("来源记录页面"))}</p><p>{link(image.sourceUrl,tr("来源网站原始图片"))}</p><p>{tr("图片署名")}：{image.credit||tr("未记录")}</p><details><summary>{tr("资料与方法")}</summary><p>{tr("权利状态")}：{image.rightsStatus==='unverified'?tr("未核实"):image.rightsStatus||tr("未记录")}</p><p>{tr("原始权利说明")}：{image.sourceRightsStatus||tr("未记录")}</p>{image.rightsNote&&<p>{image.rightsNote}</p>}<p>{link(image.rightsSourceUrl,tr("权利说明出处"))}</p><p>{tr("记录尺寸")}：{image.width&&image.height?`${image.width} × ${image.height} px`:tr("未记录；加载后的实际尺寸见图片视口")}</p></details></section>;
}
