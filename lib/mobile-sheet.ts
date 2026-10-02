export type SheetState='summary'|'half'|'reading';
export const sheetStates:SheetState[]=['summary','half','reading'];
export function sheetHeight(state:SheetState,available:number){const h=Math.max(0,available);return state==='summary'?Math.min(128,h*.4):h*(state==='half'?.5:.88)}
export function snapSheet(height:number,available:number):SheetState{return sheetStates.reduce((best,s)=>Math.abs(sheetHeight(s,available)-height)<Math.abs(sheetHeight(best,available)-height)?s:best,'summary')}
// Actual lower obstruction, bounded so even a short viewport has usable map space.
export function mapPadding(width:number,height:number,obstruction:number,mobile:boolean){const top=Math.min(mobile?75:100,height*.2),bottom=Math.min(Math.max(30,obstruction+18),Math.max(0,height-top-80));const side=Math.min(mobile?24:60,width*.15);return {top,bottom,left:side,right:side}}

export function mobileViewport(width:number,height:number){return width<=760||(width<=1000&&height<=500)}
