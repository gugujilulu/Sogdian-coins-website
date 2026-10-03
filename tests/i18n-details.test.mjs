import test from 'node:test';
import assert from 'node:assert/strict';
import {timeCopy,spaceCopy,rangeMessage} from '../lib/range-copy.ts';
import {rangeViews} from '../lib/range-time.ts';
import {qaraKhitaiSample} from '../lib/qara-khitai-sample.ts';
const sample=qaraKhitaiSample(['lady-nana']);
test('localized range explanations preserve raw evidence, geometry and year assessment',()=>{
 const before=JSON.stringify(sample),view=rangeViews([sample],{mode:'year',year:1142})[0];
 assert.equal(view.assessment,'uncertain');
 for(const locale of ['en','zh','ru']){
  assert.ok(timeCopy(sample,locale).includes(sample.periodText));
  assert.ok(spaceCopy(sample,locale).includes(sample.coverage.note));
  assert.ok(rangeMessage(view,locale).includes('1142'));
 }
 assert.match(timeCopy(sample,'en'),/upper bound not recorded/);
 assert.match(spaceCopy(sample,'en'),/Local coverage/);
 assert.equal(JSON.stringify(sample),before);
});
test('localization does not change default version or historical background state',()=>{
 const selected=rangeViews([sample],{mode:'year',year:1140},{},[sample.objectId])[0];
 assert.equal(selected.background,true);
 for(const locale of ['en','ru','zh']){rangeMessage(selected,locale);timeCopy(sample,locale);assert.equal(selected.selected.id,sample.id);assert.equal(selected.visible,true)}
});
