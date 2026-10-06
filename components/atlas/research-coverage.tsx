import type {Atlas} from '@/lib/atlas';
import type {MapRange} from '@/lib/map-layers';
import {countLabel} from '@/lib/i18n';
import {useLanguage,useCopy} from './language';
export default function ResearchCoverage({data,ranges,sourceCount}:{data:Atlas;ranges:MapRange[];sourceCount?:number}){
 const {locale}=useLanguage(),tr=useCopy();
 const located=data.families.filter(f=>f.anchor).length,drawn=ranges.filter(r=>r.geometry&&r.kind==='polity');
 const counts=[countLabel(data.specimens.length,'records',locale),countLabel(data.families.length,'families',locale),countLabel(data.variants.length,'groups',locale),countLabel(data.specimens.reduce((n,r)=>n+r.images.length,0),'images',locale)];
 const polities=new Set(drawn.map(r=>r.objectId)).size,contexts=ranges.filter(r=>r.geometry&&r.kind==='context').length;
 const copy={
 zh:{title:'资料覆盖与单位',unit:'主库记录、来源记录、目录组与独立实物不是同一单位。相关资料单独计数，不并入主库。',location:`已定位${located}个家族，未定位${data.families.length-located}个。地图锚点用于浏览，不自动等于铸地或出土点。`,range:`当前有${polities}个可绘政权、${drawn.length}个政权几何版本和${contexts}个地域背景。按币系年代区间筛选记录；范围使用自身年代证据。现有范围尚未构成逐年历史地图。`},
 en:{title:'Coverage and units',unit:'Main records, source records, catalogue groups and distinct physical objects are different units. Related material is counted separately from the main collection.',location:`${located} families are located; ${data.families.length-located} are unlocated. Map anchors support browsing and do not automatically identify mints or findspots.`,range:`There are ${polities} drawable polities, ${drawn.length} polity geometry versions and ${contexts} regional backgrounds. Records are filtered by coin-family date intervals; ranges use their own date evidence. These ranges do not yet form a year-by-year historical map.`},
 ru:{title:'Охват и единицы',unit:'Основные записи, записи источников, группы каталога и отдельные физические предметы — разные единицы. Сопутствующие материалы учитываются отдельно.',location:`Локализовано ${located} семейств, не локализовано ${data.families.length-located}. Опорные точки служат для просмотра, не означая автоматически монетные дворы или места находок.`,range:`Доступно ${polities} государств с геометрией, ${drawn.length} геометрических версий и ${contexts} региональных фонов. Записи фильтруются по датам монетного семейства; территории используют собственные даты. Это ещё не историческая карта для каждого года.`}
 }[locale];
 return <details><summary>{copy.title}</summary><p>{counts.join(' · ')}{sourceCount!=null&&<> · {countLabel(sourceCount,'sources',locale)}</>}</p><p>{tr('相关资料')} · {countLabel(data.relatedRecords.length,'records',locale)}</p><p>{copy.unit}</p><p>{copy.location}</p><p>{copy.range}</p></details>;
}
