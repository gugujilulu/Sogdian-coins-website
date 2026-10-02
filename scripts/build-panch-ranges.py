"""Offline two-point placement of the documented Panch geographic reconstruction."""
import json, math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'docs/reviews/T22-18/construction.json').read_text())
a,b=d['calibration']['controls'];lon,lat=a['lonLat'];x0,y0=a['pixel']
kx=111320*math.cos(math.radians(lat));ky=111320
px=b['pixel'][0]-x0;py=-(b['pixel'][1]-y0)
gx=(b['lonLat'][0]-lon)*kx;gy=(b['lonLat'][1]-lat)*ky
real=(gx*px+gy*py)/(px*px+py*py);imag=(gy*px-gx*py)/(px*px+py*py)
lines=['// Generated from T22-18 construction; inferred core and local oasis, not attested borders.']
for v,name in zip(d['versions'],['panchCoreRing','panchOasisRing']):
 assert v['pixelRing'][0]==v['pixelRing'][-1]
 ring=[]
 for x,y in v['pixelRing']:
  u=x-x0;w=-(y-y0)
  ring.append([round(lon+(real*u-imag*w)/kx,6),round(lat+(imag*u+real*w)/ky,6)])
 lines.append('export const '+name+':number[][]='+json.dumps(ring,separators=(',',':'))+';')
 print(v['id'],len(ring)-1,'vertices')
(root/'lib/panch-geometry.ts').write_text('\n'.join(lines)+'\n')
