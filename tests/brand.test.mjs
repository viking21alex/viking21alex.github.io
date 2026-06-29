import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const expected = "Alex's AI CHAIN MAP";
const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8');
const catalogSource = fs.readFileSync(new URL('../data/catalog.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(catalogSource, context);

assert.match(html, new RegExp(`<title>${expected.replace("'", "\\'")}</title>`));
assert.match(html, new RegExp(`<b>${expected.replace("'", "\\'")}</b>`));
assert.equal(context.window.AI_CHAIN_DATA.meta.title, expected);
assert.match(html, /<small>全产业链知识图谱<\/small>/);

console.log('brand: ok');
