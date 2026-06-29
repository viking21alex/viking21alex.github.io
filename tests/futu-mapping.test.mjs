import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const catalogSource = fs.readFileSync(new URL('../data/catalog.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(catalogSource, context);
const companies = context.window.AI_CHAIN_DATA.companies;
const mapping = JSON.parse(fs.readFileSync(new URL('../data/futu-symbols.json', import.meta.url), 'utf8'));

assert.equal(Object.keys(mapping.companies).length, companies.length);
for (const company of companies) {
  const entry = mapping.companies[company.id];
  assert.ok(entry, `${company.name} 缺少富途覆盖记录`);
  assert.ok(
    entry.status === 'supported' || entry.status === 'unsupported-market',
    `${company.name} 的富途状态无效`,
  );
  if (entry.status === 'supported') {
    assert.match(entry.futuCode, /^(US|HK|SH|SZ|JP)\.[A-Z0-9 -]+$/);
  } else {
    assert.equal(entry.futuCode, null);
  }
}

for (const id of ['nvidia', 'alibaba', 'smic', 'tokyo-electron']) {
  assert.equal(mapping.companies[id].status, 'supported');
}
for (const id of ['tsmc', 'samsung']) {
  assert.equal(mapping.companies[id].status, 'unsupported-market');
}
assert.equal(mapping.companies.asml.status, 'supported', 'ASML 的纳斯达克证券可由富途覆盖');

console.log(`futu mapping: ${companies.length} companies covered`);
