/** Settled layouts only: reprojection, cover cycling and selection do not replay entry. */
export class CoinMotionState {
 private near=new Set<string>();private initialized=false;private suppress=false;
 restore(){this.suppress=true}
 settle(keys:readonly string[]){const next=new Set(keys),enter=this.initialized&&!this.suppress?keys.filter(key=>!this.near.has(key)):[];const leave=this.initialized&&!this.suppress?[...this.near].filter(key=>!next.has(key)):[];this.near=next;this.initialized=true;this.suppress=false;return {enter,leave}}
}
