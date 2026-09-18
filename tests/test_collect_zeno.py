import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('collect_zeno',ROOT/'scripts/collect-zeno.py')
collect=importlib.util.module_from_spec(spec)
spec.loader.exec_module(collect)

class ZenoCollectorCacheTests(unittest.TestCase):
    def test_lady_nana_cached_gallery_flags_repeated_pagination_gap(self):
        snapshot=collect.gallery_snapshot(collect.make_opener(),'3106',refresh=False)
        self.assertEqual(len(snapshot['recordIds']),12)
        self.assertEqual(snapshot['sourceReportedCount'],14)
        self.assertEqual(snapshot['coverageStatus'],'incomplete_subtree_observed_links')
        self.assertEqual(snapshot['pagination']['integrity'],'failed_repeated_page_content')
        self.assertTrue(snapshot['pagination']['repeatedPages'])

    def test_turgesh_cached_subtree_is_complete_and_recursive(self):
        snapshot=collect.gallery_snapshot(collect.make_opener(),'795',refresh=False)
        self.assertEqual(len(snapshot['recordIds']),254)
        self.assertEqual(len(snapshot['categoryTree']),27)
        self.assertEqual(snapshot['sourceReportedDirectCount'],5)
        self.assertEqual(snapshot['sourceReportedSubtreeCount'],254)
        self.assertEqual(snapshot['coverageStatus'],'observed_count_matches_subtree_source_count')
        self.assertEqual(snapshot['pagination']['integrity'],'no_repeat_detected')
        direct_children={row['categoryId'] for row in snapshot['categoryTree'][0]['children']}
        self.assertEqual(direct_children,{'14906','20165','18902','797'})

    def test_lady_nana_breadcrumb_ends_at_requested_leaf(self):
        html=(ROOT/'research/zeno/388312.html').read_text(errors='replace')
        crumbs=collect.breadcrumb(html)
        self.assertEqual(crumbs[-1]['categoryId'],'3106')
        self.assertIn('Lady Nana',crumbs[-1]['title'])

    def test_cached_detail_preserves_source_fields_and_uploader(self):
        html=(ROOT/'research/zeno/388312.html').read_text(errors='replace')
        fields=collect.source_fields(html)
        self.assertEqual(fields['Weight, g'],'1.39')
        self.assertEqual(fields['Size, mm'],'19')
        self.assertEqual(fields['Date'],'AD 709–722.')
        self.assertEqual(collect.uploader_info(html)['name'],'Numis_Dmitriy')

    def test_cached_unstructured_find_note_is_preserved(self):
        html=(ROOT/'research/zeno/264184.html').read_text(errors='replace')
        self.assertEqual(collect.photo_note(html),'Unearthed in N. Afghanistan')

    def test_detail_image_candidate_ignores_breadcrumb_glyph(self):
        # Zeno #219174 contains Tukhus glyphs in its breadcrumb before the coin image.
        # Those decorative assets must never become specimen photographs.
        rec=collect.collect_record(collect.make_opener(),'503','219174',download=False,refresh=False)
        self.assertIsNotNone(rec['originalImageUrl'])
        self.assertNotIn('/glyph/',rec['originalImageUrl'])
        self.assertFalse(any('/glyph/' in u for u in rec['imageCandidates']))

if __name__=='__main__':
    unittest.main()
