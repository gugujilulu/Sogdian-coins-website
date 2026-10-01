"""Rebuild the documented geographic synthesis offline; no Atlas export or network."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'docs/reviews/T22-4/overall-construction.json').read_text())
ring=[]
for segment in data['segments']:
 points=segment['coordinates']
 if ring:
  assert ring[-1]==points[0], 'Segment endpoints must agree'
  ring+=points[1:]
 else: ring+=points
assert ring[0]==ring[-1], 'Overall synthesis must close without a crop seam'
(root/'lib/turgesh-overall-geometry.ts').write_text('// Derived from docs/reviews/T22-4/overall-construction.json; documented geographic synthesis.\nexport const turgeshOverallRing = '+json.dumps(ring,separators=(',',':'))+';\n')
print('Overall synthesis rebuilt:', len(data['segments']), 'documented segments')
