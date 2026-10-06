from PIL import Image,ImageFilter,ImageDraw
import numpy as np
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
OVERRIDES=json.loads((Path(__file__).with_name('map-cutout-overrides.json')).read_text())

def components(mask):
 parent=[];runs=[];previous=[]
 def root(i):
  while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
  return i
 for y,row in enumerate(mask):
  edges=np.diff(np.pad(row.astype(np.int8),(1,1)));starts=np.where(edges==1)[0];ends=np.where(edges==-1)[0];current=[]
  for start,end in zip(starts,ends):
   label=len(parent);parent.append(label)
   for ps,pe,pl in previous:
    if ps<end and pe>start:
     r=root(pl);l=root(label)
     if r!=l:parent[l]=r
   current.append((start,end,label));runs.append((y,start,end,label))
  previous=current
 groups={}
 for y,start,end,label in runs:groups.setdefault(root(label),[]).append((y,start,end))
 out=[]
 for run in groups.values():
  if sum(e-s for y,s,e in run)<=8:continue
  xs=np.concatenate([np.arange(s,e) for y,s,e in run]);ys=np.concatenate([np.full(e-s,y) for y,s,e in run]);out.append(np.column_stack([xs,ys]))
 return out

def cut(image,override=None):
 override=override or {}
 image=image.convert('RGB');w,h=image.size
 crop=tuple(round(v*s) for v,s in zip(override['cropFraction'],[w,h,w,h])) if 'cropFraction' in override else ((0,0,int(w/2),h) if w/h>=1.45 else (0,0,w,h))
 work=image.crop(crop);ratio=min(1,400/max(work.size));work=work.resize((round(work.width*ratio),round(work.height*ratio)),Image.Resampling.LANCZOS);a=np.array(work).astype(np.int16);hh,ww=a.shape[:2]
 edge=np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]);bins=(edge//16)*16;colors,count=np.unique(bins,axis=0,return_counts=True);mode=colors[count.argmax()];bg=np.median(edge[np.max(abs(bins-mode),axis=1)<1],axis=0)
 distance=np.max(abs(a-bg),axis=2);binary=distance>override.get('threshold',22)
 binary=np.array(Image.fromarray(binary.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)))>0
 cs=components(binary)
 def score(ps):
  x,y=np.array(ps).T;bw=x.max()-x.min()+1;bh=y.max()-y.min()+1;shape=min(bw,bh)/max(bw,bh)
  return len(ps)*shape*shape
 viable=[ps for ps in cs if score(ps)>hh*ww*.01]
 if not viable:raise ValueError('no reliable coin component')
 largest=max(viable,key=score);topscore=score(largest)
 similar=[ps for ps in viable if score(ps)>=topscore*.65]
 chosen=min(similar,key=lambda ps:np.array(ps)[:,0].mean()+np.array(ps)[:,1].mean()*.2)
 mask=np.zeros((hh,ww),np.uint8);x,y=np.array(chosen).T;mask[y,x]=255
 if override.get('edgeMask'):
  # For smooth photographic shadows: trace connected native-image edge texture.
  gray=work.convert('L');lo=np.array(gray.filter(ImageFilter.MinFilter(5))).astype(float);hi=np.array(gray.filter(ImageFilter.MaxFilter(5))).astype(float)
  barrier=(hi-lo)>25
  barrier=np.array(Image.fromarray(barrier.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)))>0
  edges=components(barrier)
  if edges:
   chosen=max(edges,key=score);mask=np.zeros((hh,ww),np.uint8);x,y=chosen.T;mask[y,x]=255
 # Fill enclosed metal texture and then remove only a central background component.
 cavity=Image.new('L',(ww+2,hh+2),0);cavity.paste(Image.fromarray(mask),(1,1));ImageDraw.floodfill(cavity,(0,0),128);c=np.array(cavity)[1:-1,1:-1];inside=(c!=128)
 hole=False
 for ps in components((distance<=override.get('holeThreshold',22))&inside):
  xs,ys=np.array(ps).T;cx=(x.min()+x.max())/2;cy=(y.min()+y.max())/2;bw=x.max()-x.min()+1;bh=y.max()-y.min()+1
  if len(ps)>bw*bh*.006 and len(ps)<bw*bh*.23 and abs(xs.mean()-cx)<bw*.18 and abs(ys.mean()-cy)<bh*.18 and min(xs.max()-xs.min()+1,ys.max()-ys.min()+1)/max(xs.max()-xs.min()+1,ys.max()-ys.min()+1)>.35:
   inside[ys,xs]=False;hole=True
 if override.get('holeSeed'):
  cx=int(round((x.min()+x.max())/2));cy=int(round((y.min()+y.max())/2));seed=np.median(a[max(0,cy-2):cy+3,max(0,cx-2):cx+3].reshape(-1,3),axis=0)
  for ps in components((np.max(abs(a-seed),axis=2)<=40)&inside):
   xs,ys=ps.T;bw=x.max()-x.min()+1;bh=y.max()-y.min()+1
   if np.any((xs==cx)&(ys==cy)) and bw*bh*.006<len(ps)<bw*bh*.22 and min(xs.max()-xs.min()+1,ys.max()-ys.min()+1)/max(xs.max()-xs.min()+1,ys.max()-ys.min()+1)>.4:
    inside[ys,xs]=False;hole=True
 alpha=Image.fromarray(inside.astype('uint8')*255).resize(image.crop(crop).size,Image.Resampling.LANCZOS)
 out=image.crop(crop).convert('RGBA')
 if 'outerPolygon' in override:
  # Explicit native-photo contour and hole; no synthesized pixels.
  alpha=Image.new('L',image.size);draw=ImageDraw.Draw(alpha);draw.polygon(override['outerPolygon'],fill=255)
  if 'holePolygon' in override:draw.polygon(override['holePolygon'],fill=0);hole=True
  out=image.convert('RGBA');crop=(0,0,w,h)
 out.putalpha(alpha);box=alpha.getbbox();out=out.crop(box)
 if max(out.size)>768:out.thumbnail((768,768),Image.Resampling.LANCZOS)
 pad=max(2,round(max(out.size)*.025));final=Image.new('RGBA',(out.width+pad*2,out.height+pad*2));final.paste(out,(pad,pad))
 return final,{'crop':crop,'threshold':override.get('threshold',22),'workingScale':ratio,'background':list(map(float,bg)),'holeRemoved':hole}
if __name__=='__main__':
 import sys
 meta=json.loads(Path(sys.argv[1]).read_text());index={};errors=[];audit=[]
 if '--overrides' in sys.argv:
  prior=json.loads((ROOT/'docs/reviews/T67-9/processing-audit.json').read_text());index=json.loads((ROOT/'public/data/map-coin-cutouts.json').read_text())
  selected=set(OVERRIDES)&{i['path'] for i in meta['candidates']};errors=[e for e in prior['exceptions'] if e['path'] not in selected];audit=[i for i in prior['images'] if i['originalPath'] not in selected]
  meta['candidates']=[i for i in meta['candidates'] if i['path'] in selected]

 for j,i in enumerate(meta['candidates']):
  try:
   source=ROOT/'public'/i['path'].lstrip('/');override=OVERRIDES.get(i['path'],{})
   out,info=cut(Image.open(source),override)
   name=hashlib.sha256(i['path'].encode()).hexdigest()[:16]+'.webp';dest=ROOT/'public/visual/t67-9'/name;dest.parent.mkdir(parents=True,exist_ok=True)
   out.save(dest,quality=95,method=3)
   alpha=np.array(out.getchannel('A'));fraction=float(np.mean(alpha==0))
   if fraction<.12 or out.width<20 or out.height<20:raise ValueError('insufficient transparent background or unreliable footprint')
   index[i['path']]={'originalId':i['id'],'originalPath':i['path'],'path':'/visual/t67-9/'+name,'width':out.width,'height':out.height}
   audit.append({'originalPath':i['path'],'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'transparentFraction':round(fraction,4),**info,'override':bool(override)})
  except Exception as e:errors.append({'path':i['path'],'error':str(e)})
  if (j+1)%100==0:print(f'Processed {j+1}/{len(meta["candidates"])}; exceptions {len(errors)}',flush=True)
 (ROOT/'public/data/map-coin-cutouts.json').write_text(json.dumps(index,indent=2)+'\n')
 review=ROOT/'docs/reviews/T67-9';review.mkdir(parents=True,exist_ok=True)
 (review/'processing-audit.json').write_text(json.dumps({'defaults':meta['defaults'],'candidateCount':len(index)+len(errors),'processed':len(index),'exceptions':errors,'images':audit},indent=2)+'\n')
 print(f'Finished: {len(index)} cutouts; {len(errors)} exceptions',flush=True)
 sys.exit(1 if errors else 0)
