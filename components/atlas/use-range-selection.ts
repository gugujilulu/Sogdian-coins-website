'use client';
import {useState} from 'react';
import {updateRangeSelection,type RangeSelection} from '@/lib/range-time';
export function useRangeSelection(context:string){
 const [state,setState]=useState<RangeSelection>({context,versions:{},backgrounds:[]});
 const selection=updateRangeSelection(state,context,{type:'context'});
 // Reset only voluntary temporal override, while retaining explicit per-object versions.
 if(state.context!==context)setState(selection);
 return{selection,setVersion:(objectId:string,id:string)=>setState(s=>updateRangeSelection(s,context,{type:'version',objectId,id})),setBackground:(objectId:string,enabled:boolean)=>setState(s=>updateRangeSelection(s,context,{type:'background',objectId,enabled}))};
}
