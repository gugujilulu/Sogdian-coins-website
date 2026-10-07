"""Prepare only the supplied R3 art used by the three browse pages."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image
root=Path(__file__).resolve().parents[2]
src=Path('/private/tmp/t47-visual-input/T46-R3-complete-visual-pack')
out=root/'public/visual/t47/r3';out.mkdir(parents=True,exist_ok=True)
design=root/'design/T47-2';design.mkdir(parents=True,exist_ok=True)
names=['archive','external','caravan','floral-spray','card-corner','paper','dark-surface','watermark','rosette','book','chevron','search','expand','back','share','info']
entries=[]
for name in names:
 p=src/'web-ready'/f'{name}.png';im=Image.open(p).convert('RGBA')
 box=(0,0,*im.size) if name in ['paper','dark-surface'] else im.getchannel('A').getbbox() or (0,0,*im.size)
 im=im.crop(box);im.save(out/f'{name}.webp',quality=94,method=6)
 entries.append(dict(id=name,source=f'web-ready/{name}.png',sha256=hashlib.sha256(p.read_bytes()).hexdigest(),alphaCrop=box,size=im.size,output=f'/visual/t47/r3/{name}.webp'))
(design/'ASSETS.json').write_text(json.dumps(dict(package='T46-R3-complete-visual-pack (1).zip',processing='Supplied web-ready art; visible-alpha crop and WebP only. No coin images processed.',assets=entries),ensure_ascii=False,indent=2))
for name in ['PAGE-INDEX.md','ASSET-MAP.md','VISUAL-SPEC.md']:
 shutil.copyfile(src/name,design/name)
for name in ['CATALOGUE-DESKTOP','CATALOGUE-MOBILE','SOURCES-DESKTOP','SOURCES-MOBILE','RELATED-GALLERY-DESKTOP','RELATED-GALLERY-MOBILE']:
 shutil.copyfile(src/'preview'/f'{name}.png',design/f'{name}.png')
 shutil.copyfile(src/'layouts'/f'{name}.json',design/f'{name}.json')
print(len(entries),'R3 art assets prepared')
