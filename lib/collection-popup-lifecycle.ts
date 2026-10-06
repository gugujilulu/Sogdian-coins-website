/** DOM lifetime only; collection members and return context belong to the caller. */
export class CollectionPopupLifecycle<T extends {remove(): unknown;getElement(): HTMLElement | undefined}> {
 current:T|null=null;
 private suppressed=new WeakSet<T>();
 private cancel:(node:HTMLElement)=>void;private restoreFocus:()=>void;
 constructor(cancel:(node:HTMLElement)=>void,restoreFocus:()=>void){this.cancel=cancel;this.restoreFocus=restoreFocus}
 opened(popup:T,node:HTMLElement){
  this.current=popup;
  return ()=>{
   this.cancel(node);
   const current=this.current===popup;
   if(current)this.current=null;
   const suppressed=this.suppressed.delete(popup);
   if(current&&!suppressed)this.restoreFocus();
  };
 }
 remove(){
  const popup=this.current;if(!popup)return;
  this.current=null;
  const node=popup.getElement()?.querySelector<HTMLElement>('.coin-collection');
  if(node)this.cancel(node);
  this.suppressed.add(popup);
  try{popup.remove()}finally{this.suppressed.delete(popup)}
 }
}
