import type {Map as GLMap} from 'maplibre-gl';
export function ensureRangeStyle(map:Pick<GLMap,'getSource'|'addSource'|'getLayer'|'addLayer'>){
 const empty={type:'FeatureCollection' as const,features:[]};
   if(!map.getSource('historical-ranges'))map.addSource('historical-ranges',{type:'geojson',data:empty});
   const before=map.getLayer('coin-source-layout')?'coin-source-layout':undefined;
   const color=['get','color'] as ['get',string];
   if(!map.getLayer('history-wash'))map.addLayer({id:'history-wash',type:'fill',source:'historical-ranges',paint:{'fill-color':color,'fill-opacity':.09}},before);
   if(!map.getLayer('history-soft-edge'))map.addLayer({id:'history-soft-edge',type:'line',source:'historical-ranges',filter:['==','precision','approximate'],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],3,3,8,7,13,9],'line-blur':3,'line-opacity':.32}},before);
   if(!map.getLayer('history-keyline'))map.addLayer({id:'history-keyline',type:'line',source:'historical-ranges',filter:['==','precision','documented'],paint:{'line-color':'#fff7dc','line-width':3,'line-opacity':.65}},before);
   if(!map.getLayer('history-ink'))map.addLayer({id:'history-ink',type:'line',source:'historical-ranges',filter:['==','kind','polity'],paint:{'line-color':color,'line-width':['interpolate',['linear'],['zoom'],3,.7,9,1.25],'line-opacity':['case',['==',['get','precision'],'approximate'],.4,.85]}},before);
   if(!map.getLayer('history-circulation'))map.addLayer({id:'history-circulation',type:'line',source:'historical-ranges',filter:['!=','kind','polity'],paint:{'line-color':color,'line-width':1.4,'line-dasharray':[2,3],'line-opacity':.8}},before);
   if(!map.getLayer('history-hit'))map.addLayer({id:'history-hit',type:'fill',source:'historical-ranges',paint:{'fill-opacity':0}},before);
}
