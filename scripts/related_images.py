"""Offline related-image index. Source IDs and saved acquisition evidence only."""
import hashlib
import json
import shutil
from collections import defaultdict
from pathlib import Path
from PIL import Image
from source_identity import source_identity


def build_index(root, atlas):
    snapshots = defaultdict(list)
    files = sorted((root / 'research/zeno').glob('manifest-*.json'))
    files.append(root / 'research/zeno/recovered-records-503.json')
    for file in files:
        data = json.loads(file.read_text())
        for r in data.get('records', data.get('recoveredRecords', [])):
            snapshots[str(r['id'])].append((r, str(file.relative_to(root))))
    repair_doc = 'research/zeno/image-repair-run-503.json'
    repairs = {str(r['id']): r for r in json.loads((root / repair_doc).read_text())['successful']}
    run_doc = 'research/zeno/target-image-run-503.json'
    run = json.loads((root / run_doc).read_text())
    acquired = set(map(str, run['successfulImageIds']))
    rows = []
    for related in atlas['relatedRecords']:
        provider, key, state = source_identity(related['sourceUrl'], related['sourceRecordId'])
        if provider != 'Zeno' or state != 'resolved':
            raise ValueError('Related source needs explicit identity: ' + related['id'])
        evidence = snapshots.get(key, [])
        candidates = []
        # Explicit image metadata supports additional photographs without using array order as identity.
        for r, doc in evidence:
            if source_identity(r['url'], record_id=r['id'])[:2] != (provider, key):
                raise ValueError('Source identity mismatch')
            if r.get('image'):
                im = r['image']
                candidates.append((im['url'], im['path'], im.get('sha256'), doc, r))
        if key in repairs:
            im = repairs[key]
            candidates.append((im['url'], im['path'], im['sha256'], repair_doc, evidence[-1][0] if evidence else {}))
        elif not candidates and key in acquired:
            for r, doc in evidence:
                if r.get('originalImageUrl'):
                    candidates.append((r['originalImageUrl'], 'public/coins/zeno/' + key + '.jpg', None, doc, r))
        images = {}
        rejected = []
        for url, saved_path, expected_hash, doc, metadata in candidates:
            if '/glyph/' in url.lower():
                rejected.append({'url': url, 'reason': 'decorative_glyph_not_photograph', 'document': doc})
                continue
            relative = saved_path.lstrip('/')
            if relative.startswith('coins/'):
                relative = 'public/' + relative
            path = (root / relative).resolve()
            if not path.is_relative_to(root.resolve()):
                raise ValueError('Image path outside repository')
            # The established review directory retains original source-ID filenames.
            # Repair hashes verify relocated bytes; otherwise acquisition ID + URL is required.
            relocated = root / 'research/zeno/reviewed-related-images-503' / (key + '.jpg')
            if not path.is_file() and relocated.is_file() and Path(relative).name == key + '.jpg':
                path = relocated.resolve()
            if not path.is_file():
                rejected.append({'url': url, 'reason': 'local_file_missing', 'document': doc})
                continue
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if expected_hash and digest != expected_hash:
                rejected.append({'url': url, 'reason': 'saved_hash_mismatch', 'document': doc})
                continue
            with Image.open(path) as photo:
                width, height = photo.size
                photo.verify()
            identity = (str(path.relative_to(root.resolve())), url)
            rights = metadata.get('rights') or {}
            image_meta = metadata.get('image') or {}
            proof = {'document': doc, 'sourceRecordKey': key, 'savedPath': saved_path,
                     'method': 'saved_sha256' if expected_hash else 'acquisition_id_filename_and_manifest_url'}
            if not expected_hash:
                proof['acquisitionDocument'] = run_doc
            if identity in images:
                images[identity]['evidence'].append(proof)
                continue
            public_path = '/' + identity[0].removeprefix('public/') if identity[0].startswith('public/') else '/coins/related/' + key + '-' + digest[:16] + path.suffix.lower()
            images[identity] = {
                'id': 'related-image-' + hashlib.sha256(json.dumps([provider,key,url,identity[0]]).encode()).hexdigest()[:20],
                'sourceName': provider, 'sourceRecordId': key, 'sourceRecordUrl': related['sourceUrl'],
                'sourceUrl': url, 'localPath': identity[0], 'path': public_path,
                'width': width, 'height': height, 'sha256': digest,
                'credit': image_meta.get('credit') or (metadata.get('uploader') or {}).get('name'),
                'rightsStatus': 'unverified', 'sourceRightsStatus': image_meta.get('rightsStatus') or rights.get('status'),
                'rightsSourceUrl': image_meta.get('sourceTermsUrl') or rights.get('sourceTermsUrl'),
                'rightsNote': rights.get('note'), 'view': 'source photograph', 'evidence': [proof],
            }
        rows.append({'relatedRecordId': related['id'], 'sourceName': provider, 'sourceRecordId': key,
                     'sourceUrl': related['sourceUrl'], 'originalImageUrl': related.get('originalImageUrl'),
                     'reviewStatus': related['reviewStatus'], 'reason': related['reason'],
                     'imageStatus': 'available' if images else 'unresolved' if candidates else 'missing',
                     'images': sorted(images.values(), key=lambda im: im['id']), 'rejectedCandidates': rejected,
                     'issue': None if images else 'No verified local source photograph; original URL retained.'})
    return {'version': 1, 'recordCount': len(rows), 'records': rows}


def export_related_images(root, atlas, require_index_match=False):
    index = build_index(root, atlas)
    if require_index_match:
        saved = json.loads((root / 'public/data/related-images.json').read_text())
        if index != saved:
            raise ValueError('Related image evidence differs from saved index (missing/changed originals or metadata); refusing degraded preparation')
    for row in index['records']:
        for image in row['images']:
            original = root / image['localPath']
            destination = root / 'public' / image['path'].lstrip('/')
            if original.resolve() != destination.resolve():
                destination.parent.mkdir(parents=True, exist_ok=True)
                if not destination.exists() or hashlib.sha256(destination.read_bytes()).hexdigest() != image['sha256']:
                    shutil.copyfile(original, destination)
    (root / 'public/data/related-images.json').write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n')
    return index


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    import sys
    result = export_related_images(root, json.loads((root / 'public/data/atlas.json').read_text()), require_index_match='--prepare' in sys.argv)
    print('Related index:', len(result['records']), 'records;', sum(bool(r['images']) for r in result['records']),
          'with images;', sum(len(r['images']) for r in result['records']), 'images')
