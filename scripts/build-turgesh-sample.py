"""Offline Bregel map-9 local excerpt registration. Standard library only; no network/export of Atlas."""
import json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'docs/reviews/T22-4/source-trace.json').read_text())
places={p['id']:p for p in json.loads((ROOT/'public/data/atlas.json').read_text())['places']}
# LCC intermediate plane, 30/60 standard parallels, 75E central meridian.
r=math.radians
n=math.log(math.cos(r(30))/math.cos(r(60)))/math.log(math.tan(math.pi/4+r(60)/2)/math.tan(math.pi/4+r(30)/2))
f=math.cos(r(30))*math.tan(math.pi/4+r(30)/2)**n/n

def project(ll):
 lon,lat=map(r,ll);rho=f/math.tan(math.pi/4+lat/2)**n;theta=n*(lon-r(75))
 return [rho*math.sin(theta),-rho*math.cos(theta)]
def inverse(x,y):
 rho=math.hypot(x,y)
 return [math.degrees(math.atan2(x,-y)/n)+75,math.degrees(2*math.atan((f/rho)**(1/n))-math.pi/2)]
def solve(a,b):
 a=[list(row)+[v] for row,v in zip(a,b)]
 for i in range(len(b)):
  pivot=max(range(i,len(b)),key=lambda j:abs(a[j][i]));a[i],a[pivot]=a[pivot],a[i]
  v=a[i][i];a[i]=[x/v for x in a[i]]
  for j in range(len(b)):
   if j!=i:
    v=a[j][i];a[j]=[x-v*y for x,y in zip(a[j],a[i])]
 return [row[-1] for row in a]
# Fit source-page coordinates to geographic intermediate plane.
rows=[[1,*c['page']] for c in source['controls']]
normal=[[sum(v[i]*v[j] for v in rows) for j in range(3)] for i in range(3)]
target=[project(places[c['placeId']]['coordinates']) for c in source['controls']]
coef=[solve(normal,[sum(v[i]*q[axis] for v,q in zip(rows,target)) for i in range(3)]) for axis in range(2)]
def xy(p):return [sum(a*b for a,b in zip(c,[1,*p])) for c in coef]
def ll(p):return [round(v,5) for v in inverse(*xy(p))]
def flatten(path):
 out=[]
 for cmd in path:
  op,*v=cmd
  if op=='m':out.append(v[0])
  elif op=='l':out.append(v[0])
  elif op in ['c','v','y']:
   a=out[-1]
   if op=='v':v=[a,*v]
   if op=='y':v=[*v,v[-1]]
   b,c,d=v
   # Samples evaluate the SOURCE cubic, not invented jitter/smoothing.
   for i in range(1,9):
    t=i/8;s=1-t
    out.append([s**3*a[k]+3*s*s*t*b[k]+3*s*t*t*c[k]+t**3*d[k] for k in [0,1]])
  elif op=='h':out.append(out[0])
 return out

path=flatten(source['paths']['southernBorder'])
# Crop the already-open southern border to an explicitly selected north coverage line.
cut=source['displayCrop']['northPageY'];border=[]
for i,p in enumerate(path):
 if i and (path[i-1][1]-cut)*(p[1]-cut)<0:
  q=path[i-1];t=(cut-q[1])/(p[1]-q[1]);border.append([q[0]+t*(p[0]-q[0]),cut])
 if p[1]>=cut:border.append(p)
# West and north closures only fill the source-bounded excerpt; never political strokes.
seam=[border[-1],[border[-1][0],cut],border[0]]
ring=border+seam[1:]
report=[]
for control in source['controls']:
 actual=places[control['placeId']]['coordinates'];got=ll(control['page'])
 dx=(got[0]-actual[0])*111.2*math.cos(r(actual[1]));dy=(got[1]-actual[1])*111.2
 report.append({'placeId':control['placeId'],'sourcePage':control['page'],'existingAtlasCoordinate':actual,'registered':got,'residualKm':round(math.hypot(dx,dy),1)})
result={'geometry':{'type':'Polygon','coordinates':[[ll(p) for p in ring]]},'boundary':{'type':'MultiLineString','coordinates':[[ll(p) for p in border]]},'coverageEdge':{'type':'LineString','coordinates':[ll(p) for p in seam]},'registration':{'method':'LCC intermediate 30N/60N 75E + affine least squares; not asserted source projection','controls':report,'coefficients':coef,'maxResidualKm':max(x['residualKm'] for x in report)}}
(ROOT/'lib/turgesh-geometry.ts').write_text('// Generated offline from Bregel 2003 map 9, p.19; selected local coverage, not full borders.\nexport const turgeshGeometry = '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'docs/reviews/T22-4/registration.json').write_text(json.dumps(result['registration'],ensure_ascii=False,indent=2)+'\n')
print('Registered controls:',len(report),'max residual km:',result['registration']['maxResidualKm'])
