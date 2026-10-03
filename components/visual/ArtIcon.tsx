/** Supplied R1/R2 artwork; accessible name belongs to the existing control. */
export default function ArtIcon({name,size=20,className=''}:{name:string;size?:number;className?:string}){
 return <img className={`art-icon ${className}`} src={`/visual/t47/r2/${name}.webp`} alt="" aria-hidden="true" width={size} height={size} style={{width:size,height:size}}/>;
}
