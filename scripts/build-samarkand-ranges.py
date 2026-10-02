"""Offline local scale calibration of the documented Samarkand construction."""
import json
import math
from pathlib import Path
root = Path(__file__).resolve().parents[1]
data = json.loads((root/'docs/reviews/T22-17/construction.json').read_text())
c = data['calibration']
lon, lat = c['anchorLonLat']
x0, y0 = c['anchorPixel']
km_pixel = c['scaleKm']/c['scalePixels']
lines = ['// Generated from docs/reviews/T22-17/construction.json; approximate local calibration.']
for version, name in zip(data['versions'], ['samarkandCoreRing', 'samarkandOasisRing']):
    pixels = version['pixelRing']
    assert pixels[0] == pixels[-1]
    ring = [[round(lon+(x-x0)*km_pixel/(111.32*math.cos(math.radians(lat))), 6),
             round(lat-(y-y0)*km_pixel/111.32, 6)] for x, y in pixels]
    lines.append('export const '+name+':number[][]='+json.dumps(ring,separators=(',', ':'))+';')
    print(version['id'], len(ring)-1, 'vertices')
(root/'lib/samarkand-geometry.ts').write_text('\n'.join(lines)+'\n')
