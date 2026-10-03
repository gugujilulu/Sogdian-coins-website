import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {symbolUrl,citySymbolUrl} from '../lib/map-symbols.ts';

test('city resolver serves the supplied transparent gate for markers and legend',()=>{
 assert.equal(symbolUrl('city'),citySymbolUrl);
 const resource=readFileSync(new URL('../public'+citySymbolUrl,import.meta.url));
 assert.equal(resource.toString('ascii',0,4),'RIFF');
 assert.equal(resource.toString('ascii',8,12),'WEBP');
 assert.equal(resource.toString('ascii',12,16),'VP8X');
 assert.ok(resource[20]&0x10,'alpha channel must survive resource preparation');
 const width=resource.readUIntLE(24,3)+1,height=resource.readUIntLE(27,3)+1;
 assert.equal(width,235);assert.equal(height,134);
 assert.ok(width>height,'the gate retains the original wide proportions');
});
test('other place roles keep their own symbols, never inherit a city gate',()=>{
 const roles=['center','site','mint','mint-candidate','findspot','hoard'];
 const urls=roles.map(symbolUrl);
 assert.equal(new Set(urls).size,roles.length);
 for(const url of urls){assert.notEqual(url,citySymbolUrl);assert.ok(decodeURIComponent(url).includes('<svg'));}
});
