"""Small offline projection of existing category coverage evidence; no collection."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
scopes=json.loads((root/'research/coverage-scopes.json').read_text())
gaps=json.loads((root/'research/zeno/coverage-gaps-503.json').read_text())
atlas=json.loads((root/'public/data/atlas.json').read_text())
rows=[dict(provider='Zeno',categoryId=str(r['categoryId']),date=r['date'],count=r['sourcePhotoCount'],unit='分类照片数',note=r['note']+' 覆盖未核定。',evidence='research/coverage-scopes.json') for r in scopes]
for r in gaps['recoveryPriorityCategories']:
 rows.append(dict(provider='Zeno',categoryId=str(r['categoryId']),date=gaps['generatedOn'],count=r['observedDirectCount'],unit='当时直接观察的来源链接数',note=f"来源声明直接数 {r['sourceDeclaredDirectCount']}；已知缺口 {r['knownDirectShortfall']}；{r['coverageStatus']}。历史分页缺口登记，不代表当前补齐。",evidence='research/zeno/coverage-gaps-503.json'))
rows.append(dict(provider='Zeno',categoryId='503',date=gaps['generatedOn'],note=f"分页缺口登记涉及 {gaps['paginationAffectedCategoryCount']} 个分类；非完整采集。",evidence='research/zeno/coverage-gaps-503.json'))
c=atlas['coverage']
from urllib.parse import urlsplit,parse_qs
rows.append(dict(provider='Zeno',categoryId=parse_qs(urlsplit(c['categoryUrl']).query)['cat'][0],date=c['date'],count=c['zenoRecordCount'],unit='Nana分类快照来源记录数',note=c['scope']+'；独立覆盖快照，不是当前筛选结果。',evidence='public/data/atlas.json#/coverage'))
(root/'public/data/source-coverage.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(len(rows),'coverage evidence rows')
