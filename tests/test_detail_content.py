import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('detail',Path(__file__).resolve().parents[1]/'scripts/derive-detail-content.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class DescriptionTests(unittest.TestCase):
 def test_comparison_never_becomes_individual_description(self):
  specimen={'sources':[{'url':'other','relation':'same_specimen'},{'url':'z','relation':'comparison'}],'description':'Actual catalogue description.'}
  self.assertEqual(m.source_descriptions(specimen,{'z':{'description':'Different specimen weighs 9g.'}})[0]['text'],'Actual catalogue description.')
 def test_complementary_real_zeno_sources_are_preserved_and_duplicates_removed(self):
  s={'description':'Legacy wording','sources':[{'url':u,'relation':'same_specimen'} for u in ['z1','z2','z3']]}
  result=m.source_descriptions(s,{'z1':{'photoNote':'#1 - Sogdian inscription.'},'z2':{'description':'Tamgha on reverse.'},'z3':{'description':'Sogdian inscription.'}})
  self.assertEqual(len(result),2);self.assertNotIn('Legacy wording',[r['text'] for r in result])
 def test_material_comes_from_this_source_field_not_title_or_family(self):
  s={'description':'Fallback','sources':[{'url':'z','relation':'same_specimen'}]}
  self.assertEqual(m.source_descriptions(s,{'z':{'description':'Royal cash','sourceFields':{'Metal':'AE'}}})[0]['metal'],'AE')
  self.assertIsNone(m.source_descriptions(s,{'z':{'description':'Bronze comparison','sourceFields':{'Metal':'Invalid scraped text'}}})[0]['metal'])
if __name__=='__main__':unittest.main()
