import places from './content/place-display.json' with {type:'json'};
import {copyKnown,getCopyLocale,type Locale} from './i18n.ts';
type PlaceText={name:string;zh?:string;id:string;note?:string};
export function placeName(p:PlaceText,locale?:Locale){return copyKnown((places as Record<string,{name:Record<Locale,string>}>)[p.id]?.name[locale||getCopyLocale()]||p.name,locale)}
export function placeNote(id:string,note:string,locale:Locale){return (places as Record<string,{note:Record<Locale,string>}>)[id]?.note[locale]||copyKnown(note,locale)}
