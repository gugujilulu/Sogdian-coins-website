import type {Specimen} from './atlas';
export function galleryCaption(records:Pick<Specimen,'images'>[],total:number){const n=records.length,images=records.reduce((sum,r)=>sum+r.images.length,0);return n===total?`${n} 条记录 · ${images} 张图片`:`显示 ${n} / ${total} 条 · ${images} 张图片`}
