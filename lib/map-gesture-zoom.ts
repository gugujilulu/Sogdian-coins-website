import type {Map as GLMap} from 'maplibre-gl';

const gestureZoomGain = 1.3;
type ZoomResult = {zoomDelta?: number};
type TouchZoom = {_move: (...args: unknown[]) => ZoomResult | void};
type ScrollZoom = Pick<GLMap['scrollZoom'], 'setZoomRate' | 'setWheelZoomRate'> & {
 _type: 'wheel' | 'trackpad' | null;
 _lastWheelEvent?: WheelEvent;
 _defaultZoomRate: number;
 _wheelZoomRate: number;
 renderFrame: (...args: unknown[]) => unknown;
};

/** MapLibre 5.21 has no public pinch gain or per-device rate callback.
 * Keep its device classification, anchor, inertia and limits; adapt only gain.
 * Recheck these two narrow internal hooks when upgrading MapLibre. */
export function installGestureZoomGain(map: GLMap) {
 const touch = (map.touchZoomRotate as unknown as {_touchZoom: TouchZoom})._touchZoom;
 const move = touch._move;
 touch._move = function (...args) {
  const result = move.apply(this, args);
  if (result?.zoomDelta !== undefined) result.zoomDelta *= gestureZoomGain;
  return result;
 };
 const scroll = map.scrollZoom as unknown as ScrollZoom;
 const render = scroll.renderFrame;
 scroll.renderFrame = function (...args) {
  const defaultRate = this._defaultZoomRate, wheelRate = this._wheelZoomRate;
  // Browser trackpad pinch is delivered as a pixel-mode ctrl+wheel event.
  const pinch = this._lastWheelEvent?.ctrlKey && this._lastWheelEvent.deltaMode === 0;
  if (this._type === 'trackpad' || pinch) this.setZoomRate(defaultRate * gestureZoomGain);
  if (pinch) this.setWheelZoomRate(wheelRate * gestureZoomGain);
  try {return render.apply(this, args)}
  finally {this.setZoomRate(defaultRate);this.setWheelZoomRate(wheelRate)}
 };
 return () => {touch._move = move;scroll.renderFrame = render};
}
