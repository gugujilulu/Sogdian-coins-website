import {mapCoinImage,type CoinMember} from './coin-map.ts';
export const coverInterval=10_000;
export function coverCandidates(members:CoinMember[]){const seen=new Set<string>();return [...members].sort((a,b)=>a.family.id.localeCompare(b.family.id)).flatMap(m=>{const image=mapCoinImage(m.image);if(!image||seen.has(image.path))return [];seen.add(image.path);return [image.path]})}
/** Elapsed active time survives marker redraws; no camera or layout work belongs here. */
export class CoverCycle {
 states=new Map<string,{paths:string[];current:string;elapsed:number;pending?:string}>();
 retain(keys:Set<string>){for(const key of this.states.keys())if(!keys.has(key))this.states.delete(key)}
 sync(key:string,paths:string[],initial:string,fixed?:string){let s=this.states.get(key);if(!s||s.paths.join('|')!==paths.join('|')){s={paths,current:paths.includes(s?.current||'')?s!.current:initial,elapsed:0};this.states.set(key,s)}if(fixed){s.current=fixed;s.elapsed=0;s.pending=undefined}return s.current}
 advance(key:string,elapsed:number,paused:boolean){const s=this.states.get(key);if(!s||paused||s.paths.length<2||s.pending)return; s.elapsed+=elapsed;if(s.elapsed<coverInterval)return;s.elapsed=0;return s.pending=s.paths[(s.paths.indexOf(s.current)+1)%s.paths.length]}
 loaded(key:string,path:string,ok:boolean){const s=this.states.get(key);if(!s||s.pending!==path)return false;s.pending=undefined;if(ok)s.current=path;else s.paths=s.paths.filter(p=>p!==path);return ok}
 clear(){this.states.clear()}
}
export function initialMapCamera(saved?:{center:[number,number];zoom:number}){return saved??{center:[73,40.7] as [number,number],zoom:4.65+Math.log2(1/.8)}}
