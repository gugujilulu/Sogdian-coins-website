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
  // Talas apron: oblique drainage turns rather than a circular northern lobe.
  [70.48,42.58],[70.55,42.76],[70.70,42.85],[70.77,43.01],
  [70.98,43.08],[71.13,43.24],[71.35,43.31],[71.51,43.27],
  [71.69,43.36],[71.89,43.34],[72.04,43.45],[72.29,43.48],
  // Chu plain: a broad asymmetric shoulder, narrowing at the eastern foothills.
  [72.48,43.43],[72.63,43.52],[72.91,43.54],[73.08,43.46],
  [73.30,43.49],[73.54,43.39],[73.70,43.44],[73.92,43.35],
  [74.13,43.38],[74.30,43.27],[74.48,43.24],[74.60,43.12],
  [74.82,43.10],[74.98,43.01],[75.18,43.04],[75.34,43.15],
  // East-facing piedmont shelf; shallow drainage notches, no pointed terminal.
  [75.53,43.19],[75.70,43.33],[75.91,43.35],[76.10,43.44],
  [76.29,43.42],[76.48,43.48],[76.70,43.38],[76.83,43.25],
  [76.78,43.10],[76.59,43.03],[76.48,42.94],[76.24,42.94],
  [76.07,42.85],[75.86,42.88],[75.68,42.79],[75.44,42.78],
  // South edge follows the changing direction of the mountain front.
  [75.25,42.68],[75.08,42.67],[74.93,42.62],[74.75,42.67],
  [74.58,42.74],[74.38,42.78],[74.21,42.74],[74.02,42.77],
  [73.86,42.69],[73.68,42.68],[73.49,42.61],[73.32,42.62],
  [73.16,42.52],[72.99,42.48],[72.84,42.40],[72.61,42.38],
  [72.43,42.31],[72.23,42.33],[72.08,42.41],[71.89,42.45],
  [71.73,42.55],[71.51,42.59],[71.33,42.56],[71.18,42.61],
  [70.97,42.57],[70.81,42.62],[70.64,42.55],[70.48,42.58]
 ];
 const sogd=[[63.45,39.44],[63.55,39.67],[63.74,39.87],[64.00,40.04],[64.29,40.16],[64.62,40.23],[64.94,40.26],[65.23,40.28],[65.51,40.33],[65.79,40.39],[66.06,40.42],[66.32,40.39],[66.56,40.31],[66.77,40.20],[66.96,40.07],[67.17,39.96],[67.38,39.87],[67.62,39.80],[67.88,39.76],[68.10,39.71],[68.27,39.65],[68.37,39.56],[68.33,39.47],[68.19,39.42],[67.99,39.41],[67.78,39.40],[67.58,39.37],[67.37,39.31],[67.16,39.25],[66.95,39.22],[66.73,39.23],[66.52,39.27],[66.30,39.30],[66.08,39.30],[65.84,39.28],[65.60,39.23],[65.37,39.15],[65.14,39.08],[64.91,39.01],[64.68,38.96],[64.45,38.96],[64.23,39.00],[64.04,39.06],[63.86,39.14],[63.69,39.24],[63.55,39.34],[63.45,39.44]];
 const ranges:MapRange[]=[{id:'demo:seven-rivers:1',objectId:'demo:semirechye',familyIds:[],kind:'polity',title:'七河',labelLatin:'SEMIRECHYE',labelAngle:-3,source:'demo:visual-fixture',note:'楚河—怛逻斯山前走廊的视觉构形，非历史疆域。',start:650,end:750,precision:'approximate',display:{washOpacity:.30},label:[73.25,43.09],geometry:{type:'Polygon',coordinates:[seven]}},{id:'demo:sogd:1',objectId:'demo:sogdiana',familyIds:[],kind:'polity',title:'粟特',labelLatin:'SOGDIANA',labelAngle:-4,source:'demo:visual-fixture',note:'泽拉夫善河谷与绿洲过渡的视觉构形；渐弱带不是精度声明。',start:650,end:750,precision:'approximate',label:[66.10,40.20],geometry:{type:'Polygon',coordinates:[sogd]}}];
 const places:MapPlace[]=data.places.map(p=>({...p,claims:[{role:p.kind==='site'?'site':'city',start:null,end:null,source:p.source,note:p.note}]}));
 places.push({id:'demo:center',name:'演示中心',zh:'演示政治中心',coordinates:[70.3,44.4],kind:'city',precision:'visual fixture',source:'demo:visual-fixture',note:'非真实地点',minZoom:4,claims:[{role:'center',start:650,end:750,source:'demo:visual-fixture',note:'演示角色，不属于任何真实钱币关联。'}]},{id:'demo:hoard',name:'演示窖藏',zh:'演示窖藏',coordinates:[63.2,38.8],kind:'site',precision:'visual fixture',source:'demo:visual-fixture',note:'非真实地点',minZoom:4,claims:[{role:'hoard',start:650,end:750,source:'demo:visual-fixture',note:'演示符号，不是已发现窖藏。'}]});
 return{ranges,places,demo:true};
}
