import type {Atlas} from '@/lib/atlas';
import type {MapBackground,MapRange,MapPlace} from '@/lib/map-layers';
// DEVELOPMENT VISUAL FIXTURE ONLY. Geometry, dates and added roles are NOT historical claims.
export function visualFixture(data:Atlas):MapBackground{
 if(process.env.NODE_ENV!=='development')return{places:[],ranges:[]};
 const ranges:MapRange[]=[{id:'demo:seven-rivers:1',objectId:'demo:semirechye',familyIds:[],kind:'polity',title:'七河 · 演示体系 A',source:'demo:visual-fixture',note:'仅检验视觉的演示几何与时期，非历史疆域。',start:650,end:750,precision:'documented',label:[75.2,44.4],geometry:{type:'Polygon',coordinates:[[[69.8,42.4],[70.6,43.4],[72,44],[73.8,44.25],[75.3,44.8],[77.2,44.3],[78,43.5],[76.8,42.5],[75.3,41.95],[73.9,42.1],[72.4,41.7],[70.9,41.8],[69.8,42.4]]]}},{id:'demo:sogd:1',objectId:'demo:sogdiana',familyIds:[],kind:'polity',title:'粟特 · 演示体系 B',source:'demo:visual-fixture',note:'大致边缘样式演示，不代表实证范围。',start:650,end:750,precision:'approximate',label:[64.4,41.6],geometry:{type:'Polygon',coordinates:[[[62.4,39.1],[63.1,40.2],[64.2,42.2],[66.3,41.3],[68.4,41.4],[69.5,42.4],[70.8,42.6],[71.3,41.6],[70.3,40.6],[68.6,39.8],[67.3,38.8],[65.9,38.35],[64.1,38.45],[62.4,39.1]]]}}];
 const places:MapPlace[]=data.places.map(p=>({...p,claims:[{role:p.kind==='site'?'site':'city',start:null,end:null,source:p.source,note:p.note}]}));
 places.push({id:'demo:center',name:'演示中心',zh:'演示政治中心',coordinates:[70.3,44.4],kind:'city',precision:'visual fixture',source:'demo:visual-fixture',note:'非真实地点',minZoom:4,claims:[{role:'center',start:650,end:750,source:'demo:visual-fixture',note:'演示角色，不属于任何真实钱币关联。'}]},{id:'demo:hoard',name:'演示窖藏',zh:'演示窖藏',coordinates:[63.2,38.8],kind:'site',precision:'visual fixture',source:'demo:visual-fixture',note:'非真实地点',minZoom:4,claims:[{role:'hoard',start:650,end:750,source:'demo:visual-fixture',note:'演示符号，不是已发现窖藏。'}]});
 return{ranges,places,demo:true};
}
