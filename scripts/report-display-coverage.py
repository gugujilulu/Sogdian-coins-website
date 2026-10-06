"""Inventory exact display mappings against the existing derived source descriptions."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
content = json.loads((root/'lib/content/detail-content.json').read_text())
display = json.loads((root/'lib/content/record-display.json').read_text())
texts = {}
for record_id, sources in content['records'].items():
    for source in sources:
        text = source['text']
        if text:
            texts.setdefault(text, []).append(record_id)
entries = [{'text': text, 'localized': bool(display.get(text, {}).get('zh') and display.get(text, {}).get('ru')), 'records': list(dict.fromkeys(ids))} for text, ids in texts.items()]
covered = [record_id for record_id, sources in content['records'].items() if sources and all(source['text'] in display for source in sources)]
report = {'uniqueSourceTexts': len(entries), 'localizedTexts': sum(e['localized'] for e in entries), 'recordsWithSources': sum(bool(v) for v in content['records'].values()), 'fullyMappedRecords': len(covered), 'fullRecordIds': covered, 'entries': entries}
(root/'docs/reviews/phase1-final/translation-coverage.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print({k: v for k, v in report.items() if not isinstance(v, list)})
