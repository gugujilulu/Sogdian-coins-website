"""Public Zeno snapshot. Follow normal session forwarding; cache each public page.
Usage: python scripts/collect-zeno.py --category 3106 [--download]
No login, evasion, guessed records or claims of corpus-wide completeness.
"""
import argparse, urllib.request, urllib.parse, http.cookiejar, re, json, time, hashlib
from pathlib import Path
from html import unescape
p=argparse.ArgumentParser();p.add_argument('--category',default='3106');p.add_argument('--download',action='store_true');a=p.parse_args()
root=Path(__file__).resolve().parents[1];cache=root/'research/zeno';cache.mkdir(exist_ok=True)
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def fetch(url,path):
 if path.exists():return path.read_text()
 for _ in range(3):
  with op.open(url,timeout=30) as r:s=r.read().decode('utf-8','replace')
  m=re.search(r'http-equiv="refresh" content="[^;]+; URL=([^"]+)',s,re.I)
  if not m:path.write_text(s);time.sleep(.35);return s
  url=unescape(m.group(1))
 raise RuntimeError('Forwarding did not resolve: '+url)
def clean(s):return unescape(re.sub('<[^>]+>',' ',s)).strip()
u='https://www.zeno.ru/showgallery.php?cat='+a.category
s=fetch(u,cache/('category-'+a.category+'.html'))
print(clean(re.search(r'<title>(.*?)</title>',s,re.S).group(1)),flush=True)
gallery=s  # Includes recent/child links; each record retains its actual category breadcrumb.
ids=list(dict.fromkeys(re.findall(r'showphoto.php\?photo=(\d+)',gallery)))
pages=list(dict.fromkeys(unescape(x) for x in re.findall(r'href="([^"]*showgallery.php[^"]*page=[^"]+)"',gallery) if re.search(r'[?&]cat='+re.escape(a.category)+r'(?:&|$)',unescape(x))))
for j,url in enumerate(pages):
 ss=fetch(urllib.parse.urljoin(u,url),cache/('category-'+a.category+'-page'+str(j)+'.html'));ss=ss[ss.find('>Images '):] if '>Images ' in ss else '';ids+=re.findall(r'showphoto.php\?photo=(\d+)',ss)
ids=list(dict.fromkeys(ids));print('RECORD IDS',ids,flush=True)
manifest={'categoryId':a.category,'url':u,'retrievedOn':'2026-09-16','recordIds':ids,'recordCount':len(ids),'countSemantics':'Observed unique photo links, including recent and descendant links; not a completeness claim.','records':[]}
if a.download:
 from PIL import Image
 out=root/'public/coins/zeno';out.mkdir(parents=True,exist_ok=True)
 for id in ids:
  try:
   url='https://www.zeno.ru/showphoto.php?photo='+id;h=fetch(url,cache/(id+'.html'))
   title=clean(re.search(r'<title>(.*?)</title>',h,re.S).group(1));imgs=[x for x in re.findall(r'(?:src|href)=[\'\"]([^\'\"]+/data/[^\'\"]+)[\'\"]',h) if '/avatars/' not in x]
   js=re.findall(r"openBigWindow\('([^']+)",h)
   candidates=list(dict.fromkeys([x for x in js if '/data/' in x]+[x.replace('/medium/','/') for x in imgs]+imgs))
   image=None
   for iu in candidates:
    try:
     target=out/(id+'.jpg')
     if not target.exists():
      with op.open(unescape(iu),timeout=30) as r:target.write_bytes(r.read())
     im=Image.open(target);im.verify();im=Image.open(target)
     image={'url':unescape(iu),'path':'/coins/zeno/'+id+'.jpg','width':im.width,'height':im.height,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()};break
    except Exception:target.unlink(missing_ok=True)
   text=re.sub(r'\s+',' ',clean(h));detail=text.split('Photo Details')[-1].split('Upload Date:')[0].strip()
   def field(label):
    m=re.search(re.escape(label)+r'\s*([\d.,]+)',text);return float(m.group(1).replace(',','.')) if m else None
   record={'id':id,'url':url,'title':title,'description':detail,'weightG':field('Weight, g:'),'diameterMm':field('Size, mm:'),'image':image}
   manifest['records'].append(record);print(id,title,image and [image['width'],image['height']],flush=True)
  except Exception as e:manifest['records'].append({'id':id,'error':str(e)});print(id,str(e),flush=True)
  (cache/('manifest-'+a.category+'.json')).write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(cache/('manifest-'+a.category+'.json')).write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
