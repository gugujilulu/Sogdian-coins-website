"""Prepare supplied art, preserving alpha/aspect; never processes coin or map assets."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image
root=Path(__file__).resolve().parents[2]
inputs=Path('/private/tmp/t47-visual-input')
out=root/'public/visual/t47';out.mkdir(parents=True,exist_ok=True)
entries=[]
for group in ['r1','r2']:
 src=inputs/('T46-R1-art-only-v2' if group=='r1' else 'T46-R2-art-only-v2')
 names=['header-background','figure-left','figure-right','rosette','paper','corner','search','filters','layers','fit','locate','clock','globe','plus','minus','close','chevron','back','info']
 if group=='r2':names+=['dark-surface','detail-frame','detail-frame-fitted','watermark','card-corner','frieze','book','pin','range','share','expand','layers-light','clock-light']
 target=out/group;target.mkdir(exist_ok=True)
 for name in names:
  p=src/'assets'/f'{name}.png'; im=Image.open(p).convert('RGBA');box=im.getchannel('A').getbbox() or (0,0,*im.size)
  # Display icons are cropped to their visible alpha; materials retain their full canvas.
  crop=box if name not in ['paper','header-background','dark-surface','detail-frame','detail-frame-fitted'] else (0,0,*im.size)
  im=im.crop(crop);limit=192 if name in ['search','filters','layers','fit','locate','clock','globe','plus','minus','close','chevron','back','info','book','pin','range','share','expand','layers-light','clock-light'] else 1600 if name=='header-background' else 900 if name in ['detail-frame','detail-frame-fitted'] else 600
  im.thumbnail((limit,limit),Image.Resampling.LANCZOS);im.save(target/f'{name}.webp',quality=94,method=6)
  entries.append({'namespace':group,'asset':name,'source':str(p.relative_to(inputs)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'alphaCrop':crop,'output':f'/visual/t47/{group}/{name}.webp','size':im.size})
 for name in ['ASSET-MAP.md','CODEX-START-HERE.md']:
  shutil.copyfile(src/name,root/'design/T47-1'/f'{group}-{name}')
font=out/'fonts';font.mkdir(exist_ok=True)
for name in ['NimbusRoman-Regular.otf','NimbusRoman-Bold.otf','atlas-cjk.woff2','URW-LICENSE.txt','WQY-LICENSE.txt']:
 shutil.copyfile(inputs/'T46-R2-art-only-v2/fonts'/name,font/name)
(root/'design/T47-1/ASSETS.json').write_text(json.dumps({'sourcePackages':['Sogdian-Atlas-T46-R1-Art-Only-v2.zip','Sogdian-Atlas-T46-R2-Art-Only-v2.zip'],'processing':'Visible alpha crop, proportionate downsampling and WebP export only. Source art unchanged. No coin/map images processed.','assets':entries},ensure_ascii=False,indent=2))
for a,b in [('T46-R1-art-only-v2/preview/ATLAS-MOBILE.png','reference-mobile.png'),('T46-R2-art-only-v2/preview/ATLAS-DESKTOP.png','reference-desktop.png'),('T46-R2-art-only-v2/preview/ATLAS-DESKTOP-DETAIL.png','reference-detail.png')]:shutil.copyfile(inputs/a,root/'design/T47-1'/b)
print(len(entries),'assets prepared')
