/** Presentation only: the viewed record and selected image retain their identity. */
export function detailCloseTarget(imageExpanded:boolean){return imageExpanded?'image':'record'}
export function sourceIdentity(provider:string|undefined|null,key:string|undefined|null){
 if(!key)return provider||'';
 return provider&& !key.toLowerCase().startsWith(provider.toLowerCase())?`${provider} ${key}`:key;
}
