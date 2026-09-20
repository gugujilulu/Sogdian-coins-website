"""Offline main-corpus browsing index; reuse T03 identities, never infer new relations."""
from pathlib import Path
import hashlib
import json
from source_identity import source_identity


def build_source_index(atlas):
    entities, links = {}, {}
    for record in atlas['specimens']:
        for source in record['sources']:
            provider, key, status = source_identity(source['url'], source.get('label', ''))
            # Exactly the existing SQLite external_record ID algorithm.
            sid = 'ext-' + hashlib.sha256(json.dumps([provider, key], ensure_ascii=False).encode()).hexdigest()[:16]
            entity = entities.setdefault(sid, dict(id=sid, provider=provider, recordKey=key,
                identityStatus=status, urls=[], labels=[], paths=[]))
            for field, value in [('urls', source['url']), ('labels', source.get('label', ''))]:
                if value not in entity[field]:
                    entity[field].append(value)
            # Same evidence guard as T03 classification: never inherit a primary path.
            if provider == 'Zeno' and record.get('sourceRecordId') == 'Zeno ' + key:
                path = record.get('sourcePath') or []
                if path and path not in entity['paths']:
                    entity['paths'].append(path)
            pair = (record['id'], sid)
            relation = source['relation']
            if pair in links and links[pair]['relation'] != relation:
                raise ValueError('Conflicting existing source relations: ' + str(pair))
            links[pair] = dict(recordId=record['id'], sourceId=sid, relation=relation)
    return dict(version=1, scope='existing main-corpus source associations only',
                sources=sorted(entities.values(), key=lambda e: e['id']),
                links=sorted(links.values(), key=lambda e: (e['recordId'], e['sourceId'])))


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    result = build_source_index(json.loads((root/'public/data/atlas.json').read_text()))
    (root/'public/data/source-index.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f"Source index: {len(result['sources'])} entities; {len(result['links'])} associations")
