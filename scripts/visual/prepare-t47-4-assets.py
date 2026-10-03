"""Prepare the supplied red gate, preserving alpha and its original proportions."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image
root=Path(__file__).resolve().parents[2]
src=Path('/private/tmp/t47-visual-input/T46-R3-complete-visual-pack')
design=root/'design/T47-4';design.mkdir(parents=True,exist_ok=True)
p=src/'web-ready/city.png';im=Image.open(p).convert('RGBA');box=im.getchannel('A').getbbox();im=im.crop(box)
out=root/'public/visual/t47/r3/city.webp';im.save(out,quality=94,method=6)
(design/'ASSETS.json').write_text(json.dumps({'package':'T46-R3-complete-visual-pack (1).zip','assets':[{'id':'city','source':'web-ready/city.png','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'alphaCrop':box,'size':im.size,'output':'/visual/t47/r3/city.webp'}],'processing':'Visible-alpha crop, no recoloring or coin image processing.'},indent=2))
for name in ['CONTROLS-DESKTOP','CONTROLS-MOBILE']:
 shutil.copyfile(src/'preview'/f'{name}.png',design/f'{name}.png')
 shutil.copyfile(src/'layouts'/f'{name}.json',design/f'{name}.json')
print(im.size)
