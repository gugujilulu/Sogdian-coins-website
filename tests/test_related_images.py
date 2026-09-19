import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from related_images import build_index, export_related_images


class RelatedImageTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        (self.root/'research/zeno').mkdir(parents=True)
        (self.root/'public/data').mkdir(parents=True)
        self.atlas={'relatedRecords':[{'id':'zeno-42','sourceRecordId':'Zeno 42','sourceUrl':'https://www.zeno.ru/showphoto.php?photo=42','reviewStatus':'held','reason':'fixture','originalImageUrl':'https://www.zeno.ru/data/glyph/tamgha.png'}]}
        self.record={'id':'42','url':self.atlas['relatedRecords'][0]['sourceUrl'],'originalImageUrl':self.atlas['relatedRecords'][0]['originalImageUrl'],'rights':{'status':'unverified'},'uploader':{'name':'Original uploader'}}
        self.save('manifest-503.json',{'records':[self.record]})
        self.save('recovered-records-503.json',{'recoveredRecords':[]})
        self.save('image-repair-run-503.json',{'successful':[]})
        self.save('target-image-run-503.json',{'successfulImageIds':['42']})

    def tearDown(self):self.tmp.cleanup()
    def save(self,name,data):(self.root/'research/zeno'/name).write_text(json.dumps(data))
    def photo(self,path):
        target=self.root/path;target.parent.mkdir(parents=True,exist_ok=True)
        Image.new('RGB',(31,27),'brown').save(target)
        return hashlib.sha256(target.read_bytes()).hexdigest()

    def test_repaired_relocated_photo_preserves_original_glyph_reference(self):
        digest=self.photo('research/zeno/reviewed-related-images-503/42.jpg')
        self.save('image-repair-run-503.json',{'successful':[{'id':'42','url':'https://www.zeno.ru/data/1/photo.jpg','path':'public/coins/zeno/42.jpg','sha256':digest}]})
        result=export_related_images(self.root,self.atlas)['records'][0]
        self.assertEqual(result['reviewStatus'],'held')
        self.assertIn('/glyph/',result['originalImageUrl'])
        self.assertEqual(result['images'][0]['credit'],'Original uploader')
        self.assertEqual(result['images'][0]['width'],31)
        self.assertTrue((self.root/'public'/result['images'][0]['path'].lstrip('/')).is_file())
        self.assertEqual(result,build_index(self.root,self.atlas)['records'][0])

    def test_preparation_restores_generated_directory_and_refuses_missing_original(self):
        import shutil
        digest=self.photo('research/zeno/reviewed-related-images-503/42.jpg')
        self.save('image-repair-run-503.json',{'successful':[{'id':'42','url':'https://www.zeno.ru/data/1/photo.jpg','path':'public/coins/zeno/42.jpg','sha256':digest}]})
        exported=export_related_images(self.root,self.atlas)
        generated=self.root/'public/coins/related'
        shutil.rmtree(generated)  # Isolated disposable fixture, never repository originals.
        restored=export_related_images(self.root,self.atlas,require_index_match=True)
        self.assertEqual(restored,exported)
        photo=self.root/'public'/restored['records'][0]['images'][0]['path'].lstrip('/')
        self.assertEqual(hashlib.sha256(photo.read_bytes()).hexdigest(),digest)
        (self.root/'research/zeno/reviewed-related-images-503/42.jpg').unlink()
        with self.assertRaisesRegex(ValueError,'refusing degraded'):
            export_related_images(self.root,self.atlas,require_index_match=True)

    def test_glyph_missing_file_and_hash_mismatch_are_not_photos(self):
        self.photo('public/coins/zeno/42.jpg')
        row=build_index(self.root,self.atlas)['records'][0]
        self.assertEqual(row['images'],[])
        self.assertEqual(row['rejectedCandidates'][0]['reason'],'decorative_glyph_not_photograph')
        self.save('image-repair-run-503.json',{'successful':[{'id':'42','url':'https://www.zeno.ru/data/1/photo.jpg','path':'public/coins/zeno/42.jpg','sha256':'wrong'}]})
        self.assertEqual(build_index(self.root,self.atlas)['records'][0]['rejectedCandidates'][0]['reason'],'saved_hash_mismatch')
        (self.root/'public/coins/zeno/42.jpg').unlink()
        self.assertEqual(build_index(self.root,self.atlas)['records'][0]['rejectedCandidates'][0]['reason'],'local_file_missing')

    def test_multiple_photos_and_repeated_snapshot_do_not_duplicate_same_link(self):
        for cat,path in [('503','42.jpg'),('795','42-alt.jpg'),('3106','42.jpg')]:
            digest=self.photo('public/coins/zeno/'+path)
            record={**self.record,'image':{'url':'https://www.zeno.ru/data/1/'+path,'path':'/coins/zeno/'+path,'sha256':digest}}
            self.save('manifest-'+cat+'.json',{'records':[record]})
        row=build_index(self.root,self.atlas)['records'][0]
        self.assertEqual(len(row['images']),2)
        self.assertEqual(sorted(len(im['evidence']) for im in row['images']),[1,2])
        self.save('target-image-run-503.json',{'successfulImageIds':[]})
        self.save('manifest-503.json',{'records':[]});self.save('manifest-795.json',{'records':[]});self.save('manifest-3106.json',{'records':[]})
        self.assertEqual(build_index(self.root,self.atlas)['records'][0]['imageStatus'],'missing')


if __name__=='__main__':unittest.main()
