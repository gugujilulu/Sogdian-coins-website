// Run offline with Node >=22.13; ATLAS_PYTHON points to existing Pillow+NumPy runtime.
import {readFileSync,writeFileSync,mkdtempSync,unlinkSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {coinPlaces} from '../../lib/coin-map.ts';
import {recordSourceProvider} from '../../lib/record-filters.ts';
const root=new URL('../../',import.meta.url),data=JSON.parse(readFileSync(new URL('public/data/atlas.json',root))),candidates=new Map();
const defaults=coinPlaces(data.families,data.specimens,data.places).flatMap(g=>g.members.map(m=>({familyId:m.family.id,image:m.image})));
for(const record of data.specimens){
 const providers=new Set(['all',...record.images.map(i=>recordSourceProvider({url:i.sourceRecordUrl||'',label:'',relation:'same_specimen'}))]);
 for(const provider of providers)for(const g of coinPlaces(data.families,[record],data.places,i=>provider==='all'||recordSourceProvider({url:i.sourceRecordUrl||'',label:'',relation:'same_specimen'})===provider)){
  const m=g.members[0];if(m.image)candidates.set(m.image.path,{...m.image,familyId:m.family.id,recordId:record.id});
 }
}
const dir=mkdtempSync(join(tmpdir(),'atlas-map-cutouts-')),meta=join(dir,'covers.json');
writeFileSync(meta,JSON.stringify({defaults,candidates:[...candidates.values()]}));
try{const result=spawnSync(process.env.ATLAS_PYTHON||'python3',[new URL('prepare-map-cutouts.py',import.meta.url).pathname,meta],{stdio:'inherit'});if(result.error)throw result.error;process.exitCode=result.status??1}
finally{unlinkSync(meta);rmdirSync(dir)}
