import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('collect_zeno',ROOT/'scripts/collect-zeno.py')
collect=importlib.util.module_from_spec(spec)
spec.loader.exec_module(collect)

class ZenoCollectorCacheTests(unittest.TestCase):
    def test_lady_nana_cached_gallery_detects_repeated_pagination(self):
        snapshot=collect.gallery_snapshot(collect.make_opener(),'3106',refresh=False)
        self.assertEqual(len(snapshot['recordIds']),14)
        self.assertEqual(snapshot['sourceReportedCount'],14)
        self.assertEqual(snapshot['coverageStatus'],'observed_count_matches_source_count')
        self.assertEqual(snapshot['pagination']['integrity'],'repeated_page_content_but_count_matches_source')
        self.assertTrue(snapshot['pagination']['repeatedPages'])

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

if __name__=='__main__':
    unittest.main()
