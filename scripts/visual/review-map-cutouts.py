"""Offline contact sheets. These are mask QA composites, never product screenshots."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math
root=Path(__file__).resolve().parents[2]
review=root/'docs/reviews/T67-9'
index=json.loads((root/'public/data/map-coin-cutouts.json').read_text())
audit=json.loads((review/'processing-audit.json').read_text())
terrain=Image.open(root/'docs/reviews/T43/desktop-middle.jpg').convert('RGB')
terrain=terrain.crop((320,300,470,450)).resize((150,150))
def sheet(paths,name):
 out=Image.new('RGB',(1200,math.ceil(len(paths)/4)*185),'#eee9dc');draw=ImageDraw.Draw(out)
 for n,path in enumerate(paths):
  x=n%4*300;y=n//4*185;out.paste(terrain,(x,y));draw.rectangle((x+150,y,x+299,y+149),fill='#233747')
  if path in index:
   im=Image.open(root/'public'/index[path]['path'].lstrip('/')).convert('RGBA');im.thumbnail((134,134))
   for offset in [0,150]:out.paste(im,(x+offset+(150-im.width)//2,y+(150-im.height)//2),im)
  draw.text((x+5,y+157),path,fill='#17384b')
 out.save(review/name,quality=95)
paths=[i['image']['path'] for i in audit['defaults']]
for page in range(math.ceil(len(paths)/20)):sheet(paths[page*20:(page+1)*20],f'defaults-{page+1}.jpg')
optional=[i['originalPath'] for i in audit['images'] if i['originalPath'] not in paths]
sheet(optional[::max(1,len(optional)//40)][:40],'optional-sample.jpg')
print('All defaults composited:',len(paths),'optional sample:',min(40,len(optional)))

specials=[i['originalPath'] for i in audit['images'] if i['override']]
for page in range(math.ceil(len(specials)/20)):sheet(specials[page*20:(page+1)*20],f'specials-{page+1}.jpg')
