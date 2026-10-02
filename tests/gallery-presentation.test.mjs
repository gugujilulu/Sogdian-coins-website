import test from 'node:test';
import assert from 'node:assert/strict';
import {galleryCaption} from '../lib/gallery-presentation.ts';
test('normal gallery names record and image quantities once, retaining multi-image distinction',()=>{const rows=[{images:[{},{}]},{images:[{}]}];assert.equal(galleryCaption(rows,2),'2 条记录 · 3 张图片')});
test('partial and zero galleries express the difference to the complete family',()=>{assert.equal(galleryCaption([{images:[{}]}],8),'显示 1 / 8 条 · 1 张图片');assert.equal(galleryCaption([],8),'显示 0 / 8 条 · 0 张图片')});
