/** Presentation only: the viewed record and selected image retain their identity. */
export function detailCloseTarget(imageExpanded:boolean){return imageExpanded?'image':'record'}
export function sourceIdentity(provider:string|undefined|null,key:string|undefined|null){
 if(!key)return provider||'';
 return provider&& !key.toLowerCase().startsWith(provider.toLowerCase())?`${provider} ${key}`:key;
}

/** Only identical URLs are redundant; distinct source records remain separate. */
export function distinctSourceLinks<T extends {url:string}>(links:readonly T[]):T[]{
 const seen=new Set<string>();return links.filter(link=>{if(!link.url||seen.has(link.url))return false;seen.add(link.url);return true});
}
/** Remove only a repeated leading record identifier, never a different cited number. */
export function recordDescription(text:string,key?:string|null){
 const id=key?.replace(/^Zeno\s+/i,'').trim();if(!id)return text;
 const escaped=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return text.replace(new RegExp(`^\\s*#?${escaped}\\s*[-–—:]\\s*`),'');
}
