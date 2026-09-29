import type {Atlas} from '@/lib/atlas';
import type {MapBackground,MapRange,MapPlace} from '@/lib/map-layers';
// DEVELOPMENT VISUAL FIXTURE ONLY. Geometry, dates and added roles are NOT historical claims.
export function visualFixture(data:Atlas):MapBackground{
 if(process.env.NODE_ENV!=='development')return{places:[],ranges:[]};
 // Hand-shaped terrain study: Chu–Talas piedmont corridor and Zarafshan oasis apron.
 // Each bend follows a chosen change of basin/piedmont orientation, not randomized jitter.
 // Western Talas fan opens northward; the middle contracts along the Chu corridor;
 // the eastern apron widens beyond the intervening foothill indentation.
 // This is a terrain-composition study, not a reconstructed political boundary.
 const seven=[
  [70.55,42.55],[70.43,42.78],[70.49,43.03],[70.68,43.27],
  [70.94,43.42],[71.12,43.62],[71.24,43.87],[71.51,44.04],
  [71.83,44.09],[72.07,43.96],[72.19,43.73],[72.24,43.48],
  [72.47,43.31],[72.77,43.22],[73.05,43.20],[73.32,43.27],
  [73.56,43.43],[73.71,43.67],[73.99,43.86],[74.32,43.96],
  [74.61,43.94],[74.79,43.76],[74.87,43.52],[74.94,43.28],
  [75.14,43.12],[75.42,43.13],[75.67,43.28],[75.88,43.48],
  [76.16,43.60],[76.46,43.64],[76.77,43.57],[77.00,43.42],
  [77.12,43.18],[77.07,42.99],[76.85,42.88],[76.57,42.83],
  [76.27,42.80],[76.03,42.74],[75.78,42.72],[75.53,42.65],
  [75.26,42.54],[75.01,42.52],[74.73,42.59],[74.46,42.69],
  [74.19,42.74],[73.93,42.72],[73.66,42.65],[73.39,42.60],
  [73.12,42.51],[72.87,42.41],[72.61,42.31],[72.35,42.27],
  [72.11,42.31],[71.91,42.41],[71.69,42.49],[71.44,42.53],
  [71.18,42.50],[70.93,42.48],[70.72,42.49],[70.55,42.55]
 ];
 const sogd=[[63.45,39.44],[63.55,39.67],[63.74,39.87],[64.00,40.04],[64.29,40.16],[64.62,40.23],[64.94,40.26],[65.23,40.28],[65.51,40.33],[65.79,40.39],[66.06,40.42],[66.32,40.39],[66.56,40.31],[66.77,40.20],[66.96,40.07],[67.17,39.96],[67.38,39.87],[67.62,39.80],[67.88,39.76],[68.10,39.71],[68.27,39.65],[68.37,39.56],[68.33,39.47],[68.19,39.42],[67.99,39.41],[67.78,39.40],[67.58,39.37],[67.37,39.31],[67.16,39.25],[66.95,39.22],[66.73,39.23],[66.52,39.27],[66.30,39.30],[66.08,39.30],[65.84,39.28],[65.60,39.23],[65.37,39.15],[65.14,39.08],[64.91,39.01],[64.68,38.96],[64.45,38.96],[64.23,39.00],[64.04,39.06],[63.86,39.14],[63.69,39.24],[63.55,39.34],[63.45,39.44]];
 const ranges:MapRange[]=[{id:'demo:seven-rivers:1',objectId:'demo:semirechye',familyIds:[],kind:'polity',title:'七河',labelLatin:'SEMIRECHYE',labelAngle:-7,source:'demo:visual-fixture',note:'楚河—怛逻斯山前走廊的视觉构形，非历史疆域。',start:650,end:750,precision:'approximate',display:{transitionKm:7,washOpacity:.25},label:[74.12,43.47],geometry:{type:'Polygon',coordinates:[seven]}},{id:'demo:sogd:1',objectId:'demo:sogdiana',familyIds:[],kind:'polity',title:'粟特',labelLatin:'SOGDIANA',labelAngle:-4,source:'demo:visual-fixture',note:'泽拉夫善河谷与绿洲过渡的视觉构形；渐弱带不是精度声明。',start:650,end:750,precision:'approximate',label:[66.10,40.20],geometry:{type:'Polygon',coordinates:[sogd]}}];
 const places:MapPlace[]=data.places.map(p=>({...p,claims:[{role:p.kind==='site'?'site':'city',start:null,end:null,source:p.source,note:p.note}]}));
 places.push({id:'demo:center',name:'演示中心',zh:'演示政治中心',coordinates:[70.3,44.4],kind:'city',precision:'visual fixture',source:'demo:visual-fixture',note:'非真实地点',minZoom:4,claims:[{role:'center',start:650,end:750,source:'demo:visual-fixture',note:'演示角色，不属于任何真实钱币关联。'}]},{id:'demo:hoard',name:'演示窖藏',zh:'演示窖藏',coordinates:[63.2,38.8],kind:'site',precision:'visual fixture',source:'demo:visual-fixture',note:'非真实地点',minZoom:4,claims:[{role:'hoard',start:650,end:750,source:'demo:visual-fixture',note:'演示符号，不是已发现窖藏。'}]});
 return{ranges,places,demo:true};
}
