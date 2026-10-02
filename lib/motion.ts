export const motionQuery='(prefers-reduced-motion: reduce)';
// Read at the action, so changing the system preference never leaves a stale camera setting.
export function durationFor(duration:number,reduce:boolean){return reduce?0:duration}
export function motionDuration(duration:number){return durationFor(duration,typeof window!=='undefined'&&window.matchMedia(motionQuery).matches)}
export function watchMotion(media:Pick<MediaQueryList,'matches'|'addEventListener'|'removeEventListener'>,changed:(reduce:boolean)=>void){const listener=()=>changed(media.matches);changed(media.matches);media.addEventListener('change',listener);return ()=>media.removeEventListener('change',listener)}
