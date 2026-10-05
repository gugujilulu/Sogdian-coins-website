"""Offline display layer. Reads existing evidence; never rewrites Atlas or sources."""
import json,re,html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def clean(text):
    text=html.unescape(re.sub(r'</?(?:p|div|span|a|br|b|i|em|strong|table|tr|td|ul|li)(?:\s[^>]*)?/?>',' ',text or ''))
    text=re.sub(r'\s+',' ',text).strip()
    text=re.sub(r'^#\d+\s*[-–—:]\s*','',text)
    text=re.sub(r'Photos? courtesy of [^.]+\.?|Image courtesy [^.]+\.?|I will inform you about the parameters of the coin additionally|Any comments[^.!?]*[.!?]|Unpublished, unresearched and (?:probably )?unique(?: for the moment)?[.!]?','',text,flags=re.I).strip()
    return text

def source_descriptions(specimen, records):
    out=[];seen=set()
    for source in specimen['sources']:
        if source.get('relation')=='comparison':continue
        r=records.get(source['url'])
        if not r:continue
        text=clean(r.get('photoNote') or r.get('description'))
        if not text or text in seen:continue
        seen.add(text)
        metal=(r.get('metalText') or r.get('sourceFields',{}).get('Metal') or '').strip()
        metal=metal if re.fullmatch(r'AE|AR|AV|Æ|Copper|Bronze|Silver|Gold',metal,re.I) else None
        out.append(dict(text=text,url=source['url'],provider='Zeno',rawHtml=r.get('rawHtml'),metal=metal))
    text=clean(specimen['description'])
    if not out and text and not re.search(r'^(Primary Zeno|Source specimen\.|Stage-\d)',text):
        source=next((s for s in specimen['sources'] if s.get('relation')!='comparison'),None)
        out.append(dict(text=text,url=source['url'] if source else '',provider=specimen.get('sourceName') or 'Catalogue',rawHtml=None))
    return sorted(out,key=lambda r:r['url'])

def main():
    atlas=json.loads((ROOT/'public/data/atlas.json').read_text());records={}
    for key in ['503','795','3106']:
        for r in json.loads((ROOT/f'research/zeno/manifest-{key}.json').read_text())['records']:
            records[r['url']]=r
    families={}
    for line in (ROOT/'lib/content/family-introductions.tsv').read_text().splitlines():
        fid,en,zh,ru=line.split('\t');families[fid]=dict(en=en,zh=zh,ru=ru)
    assert set(families)=={f['id'] for f in atlas['families']}
    derived={s['id']:source_descriptions(s,records) for s in atlas['specimens']}
    (ROOT/'lib/content/detail-content.json').write_text(json.dumps(dict(families=families,records=derived),ensure_ascii=False,indent=2)+'\n')
    counts={'records':len(derived),'families':len(families),'recordsWithIndividualSourceText':sum(bool(v) for v in derived.values()),'recordsWithZenoText':sum(any(r['provider']=='Zeno' for r in v) for v in derived.values()),'recordsWithOtherSourceText':sum(any(r['provider']!='Zeno' for r in v) for v in derived.values()),'recordsWithLocalizedFamilyBackground':len(derived),'familiesWithThreeLanguages':len(families),'recordsUsingFamilyOnly':[k for k,v in derived.items() if not v]}
    (ROOT/'docs/reviews/T67-5/coverage.json').write_text(json.dumps(counts,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(counts,ensure_ascii=False))
if __name__=='__main__':main()
