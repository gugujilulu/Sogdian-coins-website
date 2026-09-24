'use client';
import {useState} from 'react';
import DetailDialog from '@/components/atlas/detail-dialog';
import ImageViewer from '@/components/atlas/image-viewer';
import ImageProvenance from '@/components/atlas/image-provenance';
const images=[{id:'missing-metadata',path:'/coins/zeno/182898.jpg',credit:'Fixture A'},{id:'404',path:'/coins/t15-intentional-404.jpg',credit:'Fixture B'}];
export default function Check(){const [open,setOpen]=useState(false),[empty,setEmpty]=useState(false),[id,setId]=useState<string|null>(null);return <main><button onClick={()=>{setEmpty(false);setId(null);setOpen(true)}}>打开缺尺寸与404夹具</button><button onClick={()=>{setEmpty(true);setOpen(true)}}>打开无图夹具</button>{open&&<DetailDialog title="测试详情" onClose={()=>setOpen(false)}><ImageViewer images={empty?[]:images} imageId={id} onSelect={setId}/><div className="modal-info"><h1>{'长标题与来源说明测试。'.repeat(30)}</h1><ImageProvenance image={empty?undefined:images.find(im=>im.id===(id||images[0].id))}/><p>{'测试说明。'.repeat(200)}</p></div></DetailDialog>}</main>}
