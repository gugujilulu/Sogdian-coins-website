import copy
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts'))
from source_index import build_source_index


class SourceIndexTests(unittest.TestCase):
    def test_saved_export_and_identity(self):
        atlas = json.loads((ROOT/'public/data/atlas.json').read_text())
        before = copy.deepcopy(atlas)
        actual = build_source_index(atlas)
        self.assertEqual(actual, json.loads((ROOT/'public/data/source-index.json').read_text()))
        self.assertEqual(atlas, before)
        zeno = next(s for s in actual['sources'] if s['provider']=='Zeno' and s['recordKey']=='20696')
        self.assertIn(dict(recordId='sr9',sourceId=zeno['id'],relation='same_specimen'), actual['links'])
        self.assertEqual(zeno['paths'], [])
        self.assertEqual(sum(l['relation']=='same_specimen' for l in actual['links']), 1013)
        self.assertEqual(sum(l['relation']=='comparison' for l in actual['links']), 7)

    def test_duplicate_memberships_and_pending(self):
        source=dict(label='Zeno 42',url='https://www.zeno.ru/showphoto.php?photo=42',relation='same_specimen')
        records=[dict(id='a',sourceRecordId='Zeno 42',sourcePath=[dict(categoryId='1',title='One')],sources=[source,source]),
                 dict(id='b',sourceRecordId='Zeno 42',sourcePath=[dict(categoryId='2',title='Two')],sources=[source]),
                 dict(id='internal-id',sources=[dict(label='Unknown original',url='https://example.org/source',relation='same_specimen')])]
        result=build_source_index(dict(specimens=records))
        self.assertEqual(len(result['sources']),2)
        self.assertEqual(len(result['links']),3)
        self.assertEqual(len(next(s for s in result['sources'] if s['provider']=='Zeno')['paths']),2)
        pending=next(s for s in result['sources'] if s['provider']=='example.org')
        self.assertEqual(pending['identityStatus'],'pending_resolution')
        self.assertEqual(pending['recordKey'],'unresolved-url:https://example.org/source')
        self.assertEqual(pending['labels'],['Unknown original'])

    def test_conflicting_existing_relations_are_not_silently_resolved(self):
        base=dict(label='Zeno 42',url='https://www.zeno.ru/showphoto.php?photo=42')
        with self.assertRaises(ValueError):
            build_source_index(dict(specimens=[dict(id='x',sources=[dict(base,relation='same_specimen'),dict(base,relation='comparison')])]))
