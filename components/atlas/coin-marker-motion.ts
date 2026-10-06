import {animate} from 'motion';
import {motionEase,motionTiming} from '@/lib/motion';
/** Owns only the inner visual. MapLibre owns the outer marker transform. */
export class CoinMarkerMotion {
 private jobs=new Map<HTMLElement|SVGElement,{stop:()=>void;finish:()=>void}>();private frame=0;
 constructor(private update:()=>void){}
 private tick=()=>{this.frame=0;if(!this.jobs.size)return;this.update();this.frame=requestAnimationFrame(this.tick)};
 run(node:HTMLElement,from:{x:number;y:number},exit=false,delay=0,finished=()=>{}){
  this.cancel(node);let done=false;const finish=()=>{if(done)return;done=true;this.jobs.delete(node);node.style.removeProperty('transform');node.style.removeProperty('opacity');finished();if(!this.jobs.size){cancelAnimationFrame(this.frame);this.frame=0}this.update()};
  const controls=animate(node,exit?{x:[0,from.x],y:[0,from.y],scale:[1,.92],opacity:[1,0]}:{x:[from.x,0],y:[from.y,0],scale:[.9,1],opacity:[0,1]}, {duration:(exit?motionTiming.gather:motionTiming.scatter-delay)/1000,delay:delay/1000,ease:motionEase.enter,onComplete:finish});
  this.jobs.set(node,{stop:()=>controls.stop(),finish});if(!this.frame)this.frame=requestAnimationFrame(this.tick);
 }
 fade(node:HTMLElement|SVGElement){
  this.cancel(node);let done=false;const finish=()=>{if(done)return;done=true;this.jobs.delete(node);node.style.removeProperty('opacity');if(!this.jobs.size){cancelAnimationFrame(this.frame);this.frame=0}};
  const controls=animate(node,{opacity:[0,1]},{duration:motionTiming.line/1000,ease:motionEase.standard,onComplete:finish});this.jobs.set(node,{stop:()=>controls.stop(),finish});
 }
 cancel(node:HTMLElement|SVGElement){const job=this.jobs.get(node);if(job){job.stop();job.finish()}}
 cancelAll(){for(const node of [...this.jobs.keys()])this.cancel(node);cancelAnimationFrame(this.frame);this.frame=0}
}
