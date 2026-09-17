export type Place={id:string;name:string;zh:string;coordinates:[number,number];kind:'city'|'site'|'region';precision:string;source:string;note:string;minZoom:number};
export type ImageRecord={id:string;path:string;sourceUrl:string;width:number;height:number;credit:string;rightsStatus:'open_license'|'permission'|'public_domain'|'unverified';rightsSourceUrl:string|null;view:string;sha256?:string|null};
export type SourcePathNode={categoryId:string;title:string};
export type SourceLink={label:string;url:string;relation:string};
export type Specimen={id:string;familyId:string;variantId:string|null;title:string;weightG:number|null;diameterMm:number|null;images:ImageRecord[];sources:SourceLink[];description:string;catalogue:string;facets:string[];duplicateStatus:string;sourceRecordId?:string;sourcePath?:SourcePathNode[];coinRole?:string;findContextClaim?:string};
export type Variant={id:string;familyId:string;title:string;reference:string;status:string;facets:string[];description:string};
export type Family={id:string;title:string;zh:string;region:string;polity?:string|null;start:number|null;end:number|null;dateLabel:string;description:string;anchor:{placeId:string;role:string;note:string}|null;image:string;status:string;question:string|null;publications:{title:string;url:string;role:string}[];legend?:string;legendNote?:string};
export type Evidence={id:string;familyId:string;placeId:string;kind:'hoard'|'findspot'|'context';source:string;note:string;start:number|null;end:number|null};
export type Area={id:string;familyId:string;kind:'documented_circulation'|'inferred_distribution'|'geographic_context';title:string;source:string;note:string;start:number|null;end:number|null;geometry:{type:'Polygon';coordinates:number[][][]}|{type:'MultiPolygon';coordinates:number[][][][]}};
export type RelatedRecord={id:string;sourceName:string;sourceRecordId:string;sourceUrl:string;title:string;reviewStatus:string;reason:string;leafCategoryId:string;leafCategoryTitle:string;sourcePath:SourcePathNode[];originalImageUrl?:string|null};
export type ScopeCensus={parent:string;categoryId:string;title:string;url:string;sourcePhotoCount:number};
export type Coverage={categoryUrl:string;zenoRecordCount:number|null;importedZenoRecords:number;images:number;scope:string;date:string;status:string};
export type Atlas={scopeCensus:ScopeCensus[];families:Family[];variants:Variant[];specimens:Specimen[];relatedRecords:RelatedRecord[];places:Place[];evidence:Evidence[];areas:Area[];coverage:Coverage};
export function overlaps(start:number|null,end:number|null,year:number|null){return year===null||(start!==null&&end!==null&&start<=year&&year<=end)}
export function familySpecimens(data:Atlas,id:string){return data.specimens.filter(s=>s.familyId===id)}
