import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildMapBackground,defaultLayers,effectiveLayers,backgroundLayers,visibleRanges,placeClaims,rangeBounds,rangeColor,timeMatches,periodLabel} from '../lib/map-layers.ts';
import {buildGeographyIndex} from '../lib/geography-index.ts';
const data=JSON.parse(readFileSync(new URL('../public/data/atlas.json',import.meta.url)));
const shape={type:'Polygon',coordinates:[[[65,39],[66,39],[66,40],[65,39]]]};
const range=(id,start,end,extra={})=>({id,objectId:'p',familyIds:['a'],kind:'polity',title:'test',source:'fixture',note:'test',precision:'approximate',geometry:shape,start,end,...extra});
test('formal adapter preserves the complete research scope and never invents geometry or polity dates',()=>{
 const before=JSON.stringify(data),geo=buildGeographyIndex(data),b=buildMapBackground(data,geo);
 assert.equal(b.places.length,14);assert.equal(b.ranges.length,geo.nodes.filter(n=>n.dimension==='polity').length+2);
 assert.equal(b.ranges.filter(r=>r.geometry).length,4);assert.ok(b.ranges.filter(r=>!r.geometry).every(r=>r.start===null&&r.end===null));assert.equal(b.ranges.find(r=>r.objectId==='polity:qara-khitai').objectId,'polity:qara-khitai');
 assert.ok(b.places.every(p=>p.claims.every(c=>c.role==='city'||c.role==='site')));
 assert.equal(JSON.stringify(data),before);assert.deepEqual([data.families.length,data.variants.length,data.specimens.length,data.specimens.reduce((n,r)=>n+r.images.length,0),data.relatedRecords.length],[56,120,1010,1013,701]);
 const nana=data.specimens.filter(r=>r.familyId==='lady-nana');assert.equal(nana.length,20);assert.equal(nana.reduce((n,r)=>n+r.images.length,0),22);assert.equal(nana.filter(r=>r.id.startsWith('zeno-')).length,14);
});
test('range own closed interval, unknown dates and inverted dates are not inferred from family',()=>{
 assert.ok(timeMatches({start:650,end:750},{mode:'year',year:650}));assert.ok(timeMatches({start:650,end:750},{mode:'year',year:750}));assert.ok(!timeMatches({start:650,end:750},{mode:'year',year:751}));assert.ok(!timeMatches({start:null,end:null},{mode:'year',year:700}));assert.ok(timeMatches({start:null,end:null},{mode:'unknown',year:700}));assert.ok(!timeMatches({start:750,end:650},{mode:'year',year:700}));assert.equal(periodLabel({start:null,end:null}),'适用时期未记录');
});
test('multiple range versions have a stable default; explicit choice never changes silently',()=>{
 const b={places:[],ranges:[range('old',650,700),range('new',701,750)]},s={...defaultLayers,polities:true};
 assert.deepEqual(visibleRanges(b,s,{mode:'all',year:0}).map(r=>r.id),['old']);
 assert.deepEqual(visibleRanges(b,s,{mode:'all',year:0},'a',{p:'old'}).map(r=>r.id),['old']);
 assert.equal(visibleRanges(b,s,{mode:'year',year:720},'a').length,0);
 assert.deepEqual(visibleRanges(b,s,{mode:'year',year:720},'a',{p:'new'}).map(r=>r.id),['new']);
 assert.equal(visibleRanges(b,s,{mode:'all',year:0},'other',{p:'old'}).length,0);
});
test('temporary background and base settings remain independent across close / filters',()=>{
 const base={...defaultLayers,sites:true},copy=JSON.stringify(base),b={places:[],ranges:[range('r',650,750)]};
 const temp=backgroundLayers(b,'a');assert.ok(effectiveLayers(base,temp,true).polities);assert.ok(!effectiveLayers(base,temp,false).polities);assert.equal(JSON.stringify(base),copy);
 assert.equal(visibleRanges(b,effectiveLayers(base,temp,true),{mode:'all',year:0},'a').length,1);
 assert.deepEqual(backgroundLayers(b,'missing'),{polities:false,circulation:false,context:false,findspots:false,hoards:false});
});
test('one place identity retains only explicitly associated role claims and each source',()=>{
 const p={claims:[{role:'site',source:'site',start:null,end:null},{role:'hoard',familyId:'a',source:'hoard',start:700,end:750},{role:'center',familyId:'b',source:'center',start:700,end:750}]};
 const s={...defaultLayers,hoards:true,centers:true};assert.deepEqual(placeClaims(p,s,{mode:'year',year:720},'a').map(c=>c.source),['site','hoard']);assert.deepEqual(placeClaims(p,s,{mode:'year',year:760},'a').map(c=>c.source),['site']);assert.equal(placeClaims(p,{...s,cities:false,sites:false,hoards:false,centers:false},{mode:'all',year:0},'a').length,0);
});
test('range colors are ID stable, circulation separate, empty geometry has no camera target',()=>{
 const a=rangeColor('p');assert.equal(rangeColor('p'),a);assert.notEqual(rangeColor('demo:semirechye'),rangeColor('demo:sogdiana'));
 assert.deepEqual(rangeBounds([range('a',0,1)]),[[65,39],[66,40]]);assert.equal(rangeBounds([{...range('a',0,1),geometry:undefined}]),null);
 const b={places:[],ranges:[range('a',0,1,{kind:'circulation'})]};assert.equal(visibleRanges(b,{...defaultLayers,polities:true},{mode:'all',year:0}).length,0);assert.equal(visibleRanges(b,{...defaultLayers,circulation:true},{mode:'all',year:0}).length,1);
});

test('range style installation recovers partial failure and full style replacement without duplicates',async()=>{
 const {ensureRangeStyle}=await import('../lib/map-layer-style.ts');const sources=new Map(),layers=new Map();let fail=true;
 const map={getSource:id=>sources.get(id),getLayer:id=>layers.get(id),addSource:(id,s)=>{assert.ok(!sources.has(id));sources.set(id,s)},addLayer:l=>{if(fail&&l.id==='history-ink'){fail=false;throw Error('fixture interrupted style load')}assert.ok(!layers.has(l.id));layers.set(l.id,l)}};
 assert.throws(()=>ensureRangeStyle(map));ensureRangeStyle(map);assert.equal(layers.size,7);ensureRangeStyle(map);assert.equal(layers.size,7);
 sources.clear();layers.clear();ensureRangeStyle(map);assert.equal(sources.size,2);assert.equal(layers.size,7);
});

test('print-map ranges retain an unblurred fill and distinguish approximate boundaries',async()=>{
 const {ensureRangeStyle}=await import('../lib/map-layer-style.ts');const layers=new Map();
 const map={getSource:()=>true,addSource:()=>{},getLayer:id=>layers.get(id),addLayer:l=>layers.set(l.id,l)};
 ensureRangeStyle(map);assert.equal(layers.get('history-wash').filter,undefined);
 assert.equal(layers.get('history-wash').paint['fill-antialias'],true);
 assert.deepEqual(layers.get('history-approximate').paint['line-dasharray'],[3,2]);
 assert.ok([...layers.values()].every(l=>!('line-blur' in l.paint)));
});
