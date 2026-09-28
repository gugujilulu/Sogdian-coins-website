'use client';
import {useState} from 'react';
import DetailDialog from './detail-dialog';
import ImageViewer from './image-viewer';
import ImageProvenance from './image-provenance';
import {selectedImage} from '@/lib/image-viewer';
import CopyLink from './copy-link';
import type {RelatedRecord} from '@/lib/atlas';
import {type RelatedThumbnail} from '@/lib/related-gallery';

function Link({url,children}:{url:string|null;children:React.ReactNode}) {
 return url?<a className="out-link" href={url} target="_blank" rel="noreferrer">{children} ↗</a>:<span>{children}：未记录</span>;
}
export default function RelatedDetails({record,index,onClose,matches=true}:{matches?:boolean;record:RelatedRecord;index:Map<string,RelatedThumbnail[]>|null;onClose:()=>void}) {
 const images=index?.get(record.id)||[];
 const [imageId,setImageId]=useState<string|null>(null);
 const image=selectedImage(images,imageId);
 return <DetailDialog title="相关资料详情" onClose={onClose}>
   <ImageViewer images={images} imageId={imageId} onSelect={setImageId}/>
   <div className="modal-info">{!matches&&<p role="status">此记录不符合当前筛选；不计入当前匹配数量。</p>}
    <h1 id="related-detail-title">{record.title}</h1><CopyLink link={{view:'catalogue',related:record.id}}/>
    <p>{record.sourceName} · {record.sourceRecordId}</p>
    <p><strong>审查状态：</strong>{record.reviewStatus}</p><p><strong>原始审查原因：</strong>{record.reason}</p>
    <p><strong>来源分类路径：</strong>{record.sourcePath.map(x=>`${x.title} [${x.categoryId}]`).join(' › ')||'未记录'}</p>
    <p><Link url={record.sourceUrl}>原始记录页面</Link></p>
    <ImageProvenance image={image}/>
   </div>
 </DetailDialog>;
}
