import type {ViewableImage} from './image-viewer';
export type ProvenanceImage=ViewableImage&{sourceName?:string|null;sourceRecordId?:string|null;sourceRecordUrl?:string|null;sourceUrl?:string|null;credit?:string|null;rightsStatus?:string|null;sourceRightsStatus?:string|null;rightsSourceUrl?:string|null;rightsNote?:string|null};
export default function ImageProvenance({image}:{image:ProvenanceImage|undefined}){
 if(!image)return <p>当前图片来源信息：未记录</p>;
 const link=(url:string|null|undefined,label:string)=>url?<a className="out-link" href={url} target="_blank" rel="noreferrer">{label} ↗</a>:<span>{label}：未记录</span>;
 return <section aria-label="当前图片来源信息" data-image-id={image.id}><h3>当前图片来源</h3><p>来源平台：{image.sourceName||'未记录'} · 原始记录编号：{image.sourceRecordId||'未记录 / 待解析'}</p><p>{link(image.sourceRecordUrl,'来源记录页面')}</p><p>{link(image.sourceUrl,'来源网站原始图片')}</p><p>图片署名：{image.credit||'未记录'}</p><p>权利状态：{image.rightsStatus==='unverified'?'未核实（unverified），不表示开放许可':image.rightsStatus||'未记录'}</p><p>原始权利说明：{image.sourceRightsStatus||'未记录'}</p>{image.rightsNote&&<p>{image.rightsNote}</p>}<p>{link(image.rightsSourceUrl,'权利说明出处')}</p><p>记录尺寸：{image.width&&image.height?`${image.width} × ${image.height} px`:'未记录；加载后的实际尺寸见图片视口'}</p><p>署名不等于权利人，也不代表开放许可。</p></section>;
}
