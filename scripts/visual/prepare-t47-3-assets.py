"""Reuse T47.2's visible-alpha/WebP preparation for the supplied detail artwork."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image
root=Path(__file__).resolve().parents[2]
src=Path('/private/tmp/t47-visual-input/T46-R3-complete-visual-pack')
out=root/'public/visual/t47/r3'
design=root/'design/T47-3';design.mkdir(parents=True,exist_ok=True)
entries=[]
for name in ['procession','mountain-footer','range','document','families','calendar','zoom-in','zoom-out','fit','close']:
 p=src/'web-ready'/f'{name}.png';im=Image.open(p).convert('RGBA');box=im.getchannel('A').getbbox() or (0,0,*im.size)
 im=im.crop(box);im.save(out/f'{name}.webp',quality=94,method=6)
 entries.append(dict(id=name,source=f'web-ready/{name}.png',sha256=hashlib.sha256(p.read_bytes()).hexdigest(),alphaCrop=box,size=im.size,output=f'/visual/t47/r3/{name}.webp'))
(design/'ASSETS.json').write_text(json.dumps(dict(package='T46-R3-complete-visual-pack (1).zip',processing='Visible-alpha crop and WebP; no coin image processing.',assets=entries),ensure_ascii=False,indent=2))
for name in ['RESEARCH-DESKTOP','RESEARCH-MOBILE','RECORD-DETAIL-DESKTOP','RECORD-DETAIL-MOBILE','RELATED-DETAIL-DESKTOP','RELATED-DETAIL-MOBILE','HIRES-VIEWER-DESKTOP','HIRES-VIEWER-MOBILE']:
 shutil.copyfile(src/'preview'/f'{name}.png',design/f'{name}.png')
 shutil.copyfile(src/'layouts'/f'{name}.json',design/f'{name}.json')
print('Prepared',len(entries),'supplied assets and eight references')
