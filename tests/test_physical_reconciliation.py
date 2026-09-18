"""Synthetic policy fixtures only. They never add claims to the real corpus."""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from physical_reconciliation import validate_plan, stable_id


class ReconciliationPolicyTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.quote = 'Fixture only: a and b identify the very same object INV-TEST-1.'
        (self.root/'fixture.json').write_text(json.dumps({'quote':self.quote}))
        self.assertion = {
            'specimen_id_a':'a','specimen_id_b':'b','status':'confirmed_same',
            'evidence_type':'unique_inventory_reference',
            'evidence':[{'document':'fixture.json','locator':'/quote','quoted_text':self.quote,
                         'object_reference':{'namespace':'test collection','identifier':'INV-TEST-1','specimen_ids':['a','b']}}],
            'created_method':'manual_object_evidence_review','review_note':'Synthetic positive test, not historical evidence.'}
        self.plan = {'assertions':[self.assertion],'groups':[{'members':['a','b']}]}
        self.ids = {'a','b','c'}

    def test_explicit_review_can_form_group_without_replacing_records(self):
        result = validate_plan(self.root,self.plan,self.ids)
        self.assertEqual(set(result),{('a','b')})
        self.assertEqual(self.ids,{'a','b','c'})
        self.assertEqual(stable_id('physical-',sorted(['b','a'])),stable_id('physical-',sorted(['a','b'])))

    def test_weak_evidence_cannot_confirm(self):
        for weak in ('visual_similarity','perceptual_hash_similarity','weight_tolerance','die_match','type_match','existing_comparison_reference'):
            with self.subTest(weak=weak):
                plan=copy.deepcopy(self.plan);plan['assertions'][0]['evidence_type']=weak
                with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def test_candidate_unresolved_and_distinct_cannot_form_group(self):
        for status in ('candidate_review','unresolved','confirmed_distinct'):
            with self.subTest(status=status):
                plan=copy.deepcopy(self.plan);plan['assertions'][0]['status']=status
                with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def test_no_transitive_confirmation_or_conflicting_membership(self):
        for groups in ([{'members':['a','b','c']}], [{'members':['a','b']},{'members':['a','b']}]):
            plan=copy.deepcopy(self.plan);plan['groups']=groups
            with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def test_no_singleton_or_unknown_member(self):
        for members in (['a'],['a','a'],['a','missing']):
            plan=copy.deepcopy(self.plan);plan['groups']=[{'members':members}]
            with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def test_missing_snapshot_or_quote_cannot_confirm(self):
        for field,value in (('document','missing.html'),('quoted_text','Not in source'),('locator','/missing')):
            plan=copy.deepcopy(self.plan);plan['assertions'][0]['evidence'][0][field]=value
            with self.assertRaises((ValueError,KeyError)):validate_plan(self.root,plan,self.ids)

    def test_automatic_or_unstructured_confirmation_rejected(self):
        plan=copy.deepcopy(self.plan);plan['assertions'][0]['created_method']='automatic_score'
        with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)
        plan=copy.deepcopy(self.plan);del plan['assertions'][0]['evidence'][0]['object_reference']
        with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def exact_plan(self, different=False):
        import hashlib
        data = self.root/'public/data';data.mkdir(parents=True,exist_ok=True)
        (self.root/'public/a.bin').write_bytes(b'exact fixture photo')
        (self.root/'public/b.bin').write_bytes(b'derivative fixture' if different else b'exact fixture photo')
        atlas={'specimens':[{'id':'a','images':[{'id':'ia','path':'/a.bin'}]}, {'id':'b','images':[{'id':'ib','path':'/b.bin'}]}]}
        (data/'atlas.json').write_text(json.dumps(atlas))
        hashes={i:hashlib.sha256((self.root/'public'/f).read_bytes()).hexdigest() for i,f in [('ia','a.bin'),('ib','b.bin')]}
        proof={'kind':'sha256','image_ids':['ia','ib'],'sha256':hashes,
               'source_usage_review':{'status':'reviewed_no_warning','flags':[],'note':'Synthetic source usage reviewed.'}}
        plan=copy.deepcopy(self.plan);a=plan['assertions'][0]
        a['evidence_type']='exact_image_identity';a['evidence'][0]['exact_image']=proof
        del a['evidence'][0]['object_reference']
        return plan

    def test_exact_sha256_can_confirm_without_separate_object_reference(self):
        self.assertTrue(validate_plan(self.root,self.exact_plan(),self.ids))

    def test_exact_hash_does_not_bypass_image_misuse(self):
        for flag in ('stock_image','reference_image','misassigned_image','placeholder'):
            plan=self.exact_plan();plan['assertions'][0]['evidence'][0]['exact_image']['source_usage_review']['flags']=[flag]
            with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)
        plan=self.exact_plan();plan['image_usage_warnings']=[{'specimen_ids':['a','b'],'evidence':plan['assertions'][0]['evidence'][0]}]
        with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def test_different_hash_or_perceptual_score_cannot_confirm(self):
        with self.assertRaises(ValueError):validate_plan(self.root,self.exact_plan(different=True),self.ids)
        plan=self.exact_plan();plan['assertions'][0]['evidence'][0]['exact_image']['kind']='perceptual_similarity'
        with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)

    def test_reviewed_direct_derivation_requires_local_technical_endpoints(self):
        plan=self.exact_plan(different=True);proof=plan['assertions'][0]['evidence'][0]['exact_image']
        quote='Synthetic verified crop: '+proof['sha256']['ia']+' -> '+proof['sha256']['ib']
        (self.root/'derivation.json').write_text(json.dumps({'report':quote}))
        proof['kind']='documented_direct_derivation'
        proof['technical_evidence']={'document':'derivation.json','locator':'/report','quoted_text':quote,
            'sha256':proof['sha256'],'operations':['crop'],'result':'same_original_photo_verified','reviewed_by':'fixture reviewer'}
        self.assertTrue(validate_plan(self.root,plan,self.ids))
        proof['technical_evidence']['operations']=['visual_similarity']
        with self.assertRaises(ValueError):validate_plan(self.root,plan,self.ids)
