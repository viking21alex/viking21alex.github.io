import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const mapping = JSON.parse(fs.readFileSync(new URL('../data/futu-symbols.json', import.meta.url), 'utf8'));
const source = fs.readFileSync(new URL('../data/financials.js', import.meta.url), 'utf8');
const syncScript = fs.readFileSync(new URL('../scripts/sync_futu_financials.py', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const financials = context.window.FUTU_FINANCIALS;

assert.ok(financials);
assert.equal(Object.keys(financials.companies).length, Object.keys(mapping.companies).length);
for (const [id, entry] of Object.entries(financials.companies)) {
  assert.equal(entry.source, 'Futu OpenAPI', `${id} 的数据源必须是富途`);
  assert.ok([
    'ready-to-sync',
    'ok',
    'unsupported-market',
    'symbol-unmapped',
    'permission-denied',
    'fetch-error',
  ].includes(entry.status), `${id} 的同步状态无效`);
  assert.ok('revenue' in entry);
  assert.ok('grossMargin' in entry);
  assert.ok('netIncome' in entry);
  assert.ok('marketCap' in entry);
}

assert.equal(financials.companies.tsmc.status, 'unsupported-market');
assert.equal(financials.companies.nvidia.status, 'ready-to-sync');
assert.match(syncScript, /--request-delay/, '实时同步应提供可调节的富途请求节流参数');
assert.match(syncScript, /time\.sleep/, '实时同步应在公司请求之间主动节流');
console.log(`futu financial coverage: ${Object.keys(financials.companies).length}`);
