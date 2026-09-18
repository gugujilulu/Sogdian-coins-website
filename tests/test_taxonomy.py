"""Adversarial hierarchy tests on synthetic data; no new scholarly classifications."""
import sqlite3
import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from taxonomy import node_id, validate_structure, resolution_rows, source_labels

ROOT = Path(__file__).resolve().parents[1]


class TaxonomyTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.executescript((ROOT / 'db/schema.sql').read_text())
        self.db.execute("INSERT INTO corpus VALUES ('c','test','test')")
        self.db.execute("INSERT INTO publication(id,title,publication_kind) VALUES ('p','test','test')")
        self.db.execute("INSERT INTO citation(id,publication_id) VALUES ('c','p')")
        self.db.execute("INSERT INTO specimen(id,title,citation_id,observed_on) VALUES ('s','test','c','test')")
        for key in ('f', 'g'):
            self.db.execute("INSERT INTO coin_type(id,corpus_id,title,aperture,classification_status,created_on,updated_on) VALUES (?,'c','test','square','candidate','test','test')", (key,))
            self.node(key, 'family', legacy=key)
        self.assign('f')

    def tearDown(self):
        self.db.close()

    def node(self, key, rank, parent=None, legacy=None, status='accepted'):
        self.db.execute('INSERT INTO taxonomy_node VALUES (?,?,?,?,?,?,?,?,?,?)',
                        (node_id(key), key, node_id(parent) if parent else None, rank,
                         'Synthetic name', 'Synthetic display', status, legacy, 'test evidence', 'test'))

    def assign(self, key, status='confirmed'):
        self.db.execute('INSERT INTO specimen_taxonomy_assignment VALUES (?,?,?,?,?)',
                        ('s', node_id(key), status, 'test evidence', 'test'))

    def test_future_nodes_and_rename_keep_identity(self):
        before = self.db.execute('SELECT specimen_id,taxonomy_id FROM specimen_taxonomy_assignment').fetchall()
        self.node('m','major_type','f'); self.node('v','variant','m'); self.node('sub','subvariant','v')
        self.assign('v')
        self.db.execute("UPDATE taxonomy_node SET canonical_name='Revised',display_name='Revised'")
        validate_structure(self.db)
        self.assertEqual(before, [('s', node_id('f'))])
        self.assertEqual(self.db.execute("SELECT taxonomy_id FROM taxonomy_node WHERE stable_key='v'").fetchone()[0], node_id('v'))
        self.assertEqual([r[2] for r in resolution_rows(self.db, {'s'})], ['assigned','assigned'])

    def test_family_only_and_major_only_resolution(self):
        self.assertEqual([r[2] for r in resolution_rows(self.db, {'s'})], ['unresolved','unresolved'])
        self.node('m','major_type','f'); self.assign('m')
        self.assertEqual([r[2] for r in resolution_rows(self.db, {'s'})], ['assigned','unresolved'])

    def test_provisional_not_confirmed(self):
        self.node('m','major_type','f',status='provisional'); self.assign('m','provisional')
        validate_structure(self.db)
        self.assertEqual([r[2] for r in resolution_rows(self.db, {'s'})], ['provisional','unresolved'])
        self.db.execute("UPDATE specimen_taxonomy_assignment SET assignment_status='confirmed'")
        with self.assertRaises(ValueError): validate_structure(self.db)

    def test_cross_family_confirmed_conflict(self):
        self.node('m','major_type','g'); self.node('v','variant','m'); self.assign('v')
        with self.assertRaises(ValueError): validate_structure(self.db)

    def test_sibling_confirmed_conflict(self):
        self.node('m','major_type','f'); self.node('n','major_type','f'); self.assign('m'); self.assign('n')
        with self.assertRaises(ValueError): validate_structure(self.db)

    def test_rank_skipping_and_cycle(self):
        self.node('v','variant','f')
        with self.assertRaises(ValueError): validate_structure(self.db)
        self.db.execute("UPDATE taxonomy_node SET parent_taxonomy_id=? WHERE stable_key='f'", (node_id('v'),))
        with self.assertRaises(ValueError): validate_structure(self.db)

    def test_duplicate_ids_invalid_status_missing_refs(self):
        with self.assertRaises(sqlite3.IntegrityError): self.node('f','family',legacy='f')
        with self.assertRaises(sqlite3.IntegrityError): self.node('m','major_type','f',status='guessed')
        with self.assertRaises(sqlite3.IntegrityError): self.assign('missing')
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO specimen_taxonomy_assignment VALUES ('missing',?,'confirmed','test','test')", (node_id('f'),))
        with self.assertRaises(sqlite3.IntegrityError): self.node('orphan','major_type','missing')

    def test_deprecated_cannot_receive_confirmed_assignment(self):
        self.node('m','major_type','f',status='deprecated'); self.assign('m')
        with self.assertRaises(ValueError): validate_structure(self.db)

    def test_same_label_keeps_source_and_context(self):
        for eid, provider in [('a','Zeno'),('b','Other')]:
            self.db.execute("INSERT INTO external_record(id,provider,record_key,url,identity_status,record_kind,verification_status) VALUES (?,?,'1','test','resolved','specimen','unverified')", (eid,provider))
            for context in ('["region A","Type X"]','["region B","Type X"]'):
                self.db.execute("INSERT INTO external_record_classification VALUES (?,'source',?,'x','Type X',NULL)", (eid,context))
        labels=source_labels(self.db)
        self.assertEqual(len({r[0] for r in labels}),4)
        self.assertEqual({r[5] for r in labels},{'Type X'})
        self.assertEqual({r[6] for r in labels},{'Type X'})


if __name__ == '__main__':
    unittest.main()
