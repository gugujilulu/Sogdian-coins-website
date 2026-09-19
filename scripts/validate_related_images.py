"""Verify the sidecar against source evidence and both original/static image bytes."""
import hashlib
import json
from collections import Counter, defaultdict
from related_images import build_index


def validate_related_images(root, atlas):
    index = json.loads((root / 'public/data/related-images.json').read_text())
    assert index == build_index(root, atlas), 'Related index differs from original evidence'
    assert index['recordCount'] == len(atlas['relatedRecords'])
    assert {r['relatedRecordId'] for r in index['records']} == {r['id'] for r in atlas['relatedRecords']}
    paths, hashes, ids = defaultdict(set), defaultdict(set), set()
    for row in index['records']:
        for image in row['images']:
            assert image['id'] not in ids
            ids.add(image['id'])
            assert '/glyph/' not in image['sourceUrl'].lower()
            for path in (root / image['localPath'], root / 'public' / image['path'].lstrip('/')):
                assert path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == image['sha256']
            paths[image['localPath']].add((row['sourceName'],row['sourceRecordId']))
            hashes[image['sha256']].add(row['relatedRecordId'])
    assert all(len(owners)==1 for owners in paths.values()), 'Shared local path needs explicit review'
    print('T08:',len(index['records']),'records;',len(ids),'images;',dict(Counter(r['imageStatus'] for r in index['records'])))
    print('T08 repeated hash groups (not physical identity):',[sorted(v) for v in hashes.values() if len(v)>1])
    print('T08 PASS: original source IDs, review status/reason, URLs, dimensions, local/static hashes and deterministic index checked')
