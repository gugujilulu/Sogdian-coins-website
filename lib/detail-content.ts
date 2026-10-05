import content from './content/detail-content.json' with {type:'json'};
import type {Locale} from './i18n';
export type DescriptionSource={text:string;url:string;provider:string;rawHtml?:string|null};
/** Image correspondence wins among real source links, never comparison records. */
export function orderDescriptions(entries:readonly DescriptionSource[],imageUrl?:string){
 return [...entries].sort((a,b)=>Number(b.provider==='Zeno')-Number(a.provider==='Zeno')||Number(b.url===imageUrl)-Number(a.url===imageUrl)||a.url.localeCompare(b.url));
}
export function recordContent(id:string,imageUrl?:string){return orderDescriptions((content.records as Record<string,DescriptionSource[]>)[id]||[],imageUrl)}
export function familyIntroduction(id:string,locale:Locale){return (content.families as Record<string,Record<Locale,string>>)[id]?.[locale]||''}
/** Short localized reading aid, based only on words in this record's source text.
 * The complete source text follows, with inscriptions and detailed claims intact. */
const features=[
 [/Sog[dh]+ian (?:royal )?(?:legend|inscription)|Sog[dh]+ian text/i,['a Sogdian inscription','粟特文铭文','согдийская надпись']],
 [/Arabic|Kufic/i,['an Arabic inscription','阿拉伯文铭文','арабская надпись']],
 [/Chinese (?:legend|character|inscription)|Kai.?yuan|開元通寶|周元通寶/i,['Chinese cash lettering','汉字钱文','китайская монетная надпись']],
 [/runic/i,['runic signs','如尼符号','рунические знаки']],
 [/tamgha/i,['tamghas','徽记','тамги']],
 [/portrait|bust|bearded head/i,['a portrait','人物肖像','портрет']],
 [/\bcross(?:es)?\b/i,['crosses','十字图案','кресты']],
 [/\bcrescent\b/i,['a crescent','新月图案','полумесяц']],
 [/plain reverse|rev(?:erse)?[.:\s]+plain/i,['a plain reverse','素面背面','гладкая оборотная сторона']],
] as const;
export function sourceReading(text:string,locale:Locale){
 const index=locale==='en'?0:locale==='zh'?1:2;
 const found=features.filter(([re])=>re.test(text)).map(([,labels])=>labels[index]);
 if(!found.length)return '';
 return locale==='zh'?`来源描述提及${found.join('、')}。`:locale==='ru'?`В описании источника упоминаются: ${found.join(', ')}.`:`The source description mentions ${found.join(', ')}.`;
}
