"""Offline deterministic assembly of documented geographic synthesis segments."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'docs/reviews/T22-8/construction.json').read_text())
ring=[]
for s in data['segments']:
    if ring:
        assert ring[-1]==s['points'][0], 'segment endpoint mismatch'
        ring.extend(s['points'][1:])
    else:
        ring.extend(s['points'])
assert ring[0]==ring[-1]
(root/'lib/semirechye-geometry.ts').write_text('// Derived from docs/reviews/T22-8/construction.json; do not edit separately.\nexport const semirechyeRing:number[][]='+json.dumps(ring,separators=(',',':'))+';\n')
print(f'Semirechye: {len(data["segments"])} source segments, {len(ring)-1} ring vertices')
