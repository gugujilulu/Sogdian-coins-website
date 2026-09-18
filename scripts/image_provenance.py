"""Read-only image attribution from exact local acquisition evidence, not appearance."""
import json
from collections import defaultdict
from source_identity import source_identity


def evidence_index(root):
    index = defaultdict(list)

    def add(path, image_url, page_url, label, document, record_id, method,
            raw_html=None, original_id=None, **details):
        if not path or not image_url or not page_url:
            return
        provider, source_key, identity_status = source_identity(
            page_url, label, record_id=original_id)
        index[(path, image_url)].append({
            'provider': provider, 'source_key': source_key,
            'identity_status': identity_status, 'source_page_url': page_url,
            'source_image_url': image_url, 'local_image_path': path,
            'document': document, 'record_id': str(record_id),
            'raw_html': raw_html if raw_html and (root / raw_html).is_file() else None,
            'raw_html_reference': raw_html,
            'raw_html_status': ('available' if (root / raw_html).is_file() else 'missing') if raw_html else 'not_recorded',
            'method': method, **details,
        })

    source_records = defaultdict(list)
    manifests = sorted((root / 'research/zeno').glob('manifest-*.json'))
    manifests.append(root / 'research/zeno/recovered-records-503.json')
    for file in manifests:
        data = json.loads(file.read_text())
        document = str(file.relative_to(root))
        for record in data.get('records', data.get('recoveredRecords', [])):
            source_records[str(record['id'])].append((record, document))
            image = record.get('image') or {}
            image_url = image.get('url') or record.get('originalImageUrl')
            # This is build-atlas.py's established record-ID filename convention.
            # Both filename AND the saved image URL must match the current image.
            path = image.get('path') or '/coins/zeno/' + str(record['id']) + '.jpg'
            add(path, image_url, record.get('url'), '', document, record['id'],
                'manifest_path_and_url' if image.get('path') else 'record_filename_and_url',
                raw_html=record.get('rawHtml'), original_id=record['id'])

    # build-atlas.py uses these saved successful repairs instead of old glyph URLs.
    # Join on explicit original record ID, exact downloaded path AND actual URL.
    repair_document = 'research/zeno/image-repair-run-503.json'
    for repaired in json.loads((root / repair_document).read_text())['successful']:
        for record, source_document in source_records.get(str(repaired['id']), []):
            add('/' + repaired['path'].removeprefix('public/'), repaired['url'],
                record.get('url'), '', repair_document, repaired['id'],
                'saved_repair_path_url_and_record', raw_html=record.get('rawHtml'),
                original_id=record['id'], source_document=source_document)

    # Legacy paths are recorded explicitly in coins.json; use record IDs, not order.
    legacy = {record['id']: record['image'] for record in
              json.loads((root / 'public/data/coins.json').read_text())}
    document = 'research/source-register.json'
    for record in json.loads((root / document).read_text())['specimens']:
        add(legacy.get(record['id']), record.get('imageUrl'), record.get('sourceUrl'),
            '', document, record['id'], 'legacy_register_path_and_url',
            path_document='public/data/coins.json')

    document = 'research/nana-source-register.json'
    for record in json.loads((root / document).read_text())['records']:
        # The importer uses these stable record filenames, including PDF derivatives.
        # Retain PDF page/crop notes; the image host need not be the source provider.
        details = {key: record[key] for key in
                   ('source_pdf', 'pdf_page', 'image_derivation') if record.get(key) is not None}
        add('/coins/nana/' + record['id'] + '.jpg',
            record.get('image_url') or record.get('source_pdf'), record['source_page'],
            record['source_credit'].split(';')[0], document, record['id'],
            'nana_register_filename_and_url', **details)
        alternate = record.get('alternate_image') or {}
        if alternate.get('image_url'):
            add('/coins/nana/' + record['id'] + '-alternate.jpg', alternate['image_url'],
                record['source_page'], record['source_credit'].split(';')[0],
                document, record['id'], 'nana_register_alternate_path_and_url')
    return index


def resolve_image(image, specimen_id, index, entities, associations, urls):
    """Select only one evidence-supported T03 entity; retain all candidate evidence."""
    evidence = sorted({json.dumps(row, ensure_ascii=False, sort_keys=True)
                       for row in index.get((image['path'], image['sourceUrl']), [])})
    records = [json.loads(row) for row in evidence]
    candidates = {(r['provider'], r['source_key']) for r in records}
    result = dict(external_record_id=None, source_page_url=None,
                  status='unresolved', method='no_local_evidence',
                  evidence_json='[' + ','.join(evidence) + ']',
                  notes='No exact local path + source image URL evidence.')
    if len(candidates) > 1:
        result.update(status='ambiguous', method='conflicting_local_evidence',
                      notes='Several source identities match; no source selected.')
    elif len(candidates) == 1:
        identity = next(iter(candidates))
        entity = entities.get(identity)
        if entity is None:
            result.update(method='source_entity_missing',
                          notes='Local evidence has no existing T03 source entity; not created here.')
        elif (specimen_id, entity['id']) not in associations:
            result.update(method='specimen_source_unconfirmed',
                          notes='Evidence source is not a same_specimen association; no identity changes made.')
        elif not all((entity['id'], row['source_page_url']) in urls for row in records):
            result.update(method='source_url_unconfirmed',
                          notes='Evidence URL is not attached to the existing source entity.')
        else:
            result.update(external_record_id=entity['id'],
                          source_page_url=min(row['source_page_url'] for row in records),
                          method='exact_local_path_and_url', notes=None)
            if entity['identity_status'] == 'resolved':
                result['status'] = 'resolved'
            else:
                result['notes'] = 'Source page is identified; T03 original record key is pending_resolution.'
    return result


def export_image_provenance(root, atlas, db, cite):
    index = evidence_index(root)
    entities = {(p, k): {'id': eid, 'identity_status': status}
                for eid, p, k, status in db.execute(
                    'SELECT id,provider,record_key,identity_status FROM external_record')}
    associations = set(db.execute("SELECT specimen_id,external_record_id FROM specimen_external_record WHERE relation='same_specimen'"))
    urls = set(db.execute('SELECT external_record_id,url FROM external_record_url'))
    for specimen in sorted(atlas['specimens'], key=lambda row: row['id']):
        for image in sorted(specimen['images'], key=lambda row: row['id']):
            result = resolve_image(image, specimen['id'], index, entities, associations, urls)
            db.execute('INSERT INTO image_provenance VALUES (?,?,?,?,?,?,?)',
                       (image['id'], result['external_record_id'], result['source_page_url'],
                        result['status'], result['method'], result['evidence_json'], result['notes']))
            # Fix the old first-specimen-source citation without inventing a page.
            citation_url = result['source_page_url'] or image['sourceUrl']
            db.execute('UPDATE image SET citation_id=? WHERE id=?', (cite(citation_url), image['id']))
