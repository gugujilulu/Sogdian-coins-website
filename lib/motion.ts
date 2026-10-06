export const motionQuery='(prefers-reduced-motion: reduce)';
// Read at the action, so changing the system preference never leaves a stale camera setting.
export function durationFor(duration:number,reduce:boolean){return reduce?0:duration}
export function motionDuration(duration:number){return durationFor(duration,typeof window!=='undefined'&&window.matchMedia(motionQuery).matches)}
export function watchMotion(media:Pick<MediaQueryList,'matches'|'addEventListener'|'removeEventListener'>,changed:(reduce:boolean)=>void){const listener=()=>changed(media.matches);changed(media.matches);media.addEventListener('change',listener);return ()=>media.removeEventListener('change',listener)}
// Milliseconds shared by CSS and the two Motion entry points; cameras keep their existing values.
export const motionTiming={feedback:120,menu:190,expand:260,panel:330,close:240,scatter:400,gather:240,line:240} as const;
export const motionEase={enter:[.22,1,.36,1] as [number,number,number,number],standard:[.4,0,.2,1] as [number,number,number,number]};
