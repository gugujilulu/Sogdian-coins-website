'use client';
import {useCopy,useLanguage} from './language';
import {copyKnown} from '@/lib/i18n';
import {useState} from 'react';
import DetailDialog from './detail-dialog';
import ImageViewer from './image-viewer';
import ImageProvenance from './image-provenance';
import {selectedImage} from '@/lib/image-viewer';
import type {RelatedRecord} from '@/lib/atlas';
import {type RelatedThumbnail} from '@/lib/related-gallery';
export default function RelatedDetails({record,index,onClose,matches=true}:{matches?:boolean;record:RelatedRecord;index:Map<string,RelatedThumbnail[]>|null;onClose:()=>void}) {
 const tr=useCopy(),{locale}=useLanguage();
 const images=index?.get(record.id)||[],[imageId,setImageId]=useState<string|null>(null),image=selectedImage(images,imageId);
 return <DetailDialog title={tr('相关资料详情')} kind="related" shareLink={{view:'catalogue',related:record.id}} onClose={onClose}>
 <ImageViewer images={images} imageId={imageId} onSelect={setImageId}/>
 <div className="modal-info">{!matches&&<p role="status">{tr('此记录不符合当前筛选；不计入当前匹配数量。')}</p>}
 <span className="eyebrow">{tr('相关资料')}</span><h1 id="related-detail-title">{record.title}</h1>
 <div className="record-source-links">{record.sourceUrl?<a className="out-link" href={record.sourceUrl} target="_blank" rel="noreferrer">{tr('原始记录页面')} ↗</a>:<p>{tr('原始记录页面')}：{tr('未记录')}</p>}</div>
 <ImageProvenance compact image={image}/>
 <details className="record-methods"><summary>{tr('资料与方法')}</summary>
 <p>{tr('来源')}：{record.sourceName}</p>
 <p><strong>{tr('审查状态')}：</strong>{copyKnown(record.reviewStatus,locale)}</p><p><strong>{tr('原始审查原因')}：</strong>{record.reason}</p>
 <p><strong>{tr('来源分类路径')}：</strong>{record.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')||tr('未记录')}</p>
 </details></div></DetailDialog>;
}
