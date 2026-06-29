import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8');

for (const fn of [
  'renderOverview',
  'renderRelations',
  'renderNodes',
  'renderCompanies',
  'applySearchAndFilters',
  'openNode',
  'openCompany',
]) {
  assert.match(source, new RegExp(`function\\s+${fn}\\b`), `缺少应用函数 ${fn}`);
}

assert.match(source, /未披露/, '财务缺失值应显示“未披露”');
assert.match(source, /noopener noreferrer/, '外部来源链接应隔离 opener');
assert.match(source, /pageSize/, '上市公司列表应分页');
assert.match(html, /data\/financials\.js/, '页面应加载富途财务覆盖文件');
assert.match(source, /FUTU_FINANCIALS/, '应用应合并富途财务覆盖');
assert.match(source, /数据状态/, '公司列表应显示富途数据状态');
assert.match(source, /Futu OpenAPI/, '公司详情应标记富途数据源');

console.log('app contract: ok');
