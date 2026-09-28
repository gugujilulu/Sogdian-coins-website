import {notFound} from 'next/navigation';
export default async function PreviewPage(){
 if(process.env.NODE_ENV!=='development')notFound();
 const {default:Preview}=await import('./preview');
 return <Preview/>;
}
