import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../data/catalog.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const data = context.window.AI_CHAIN_DATA;

assert.ok(data, 'catalog.js 应暴露 window.AI_CHAIN_DATA');
assert.equal(data.domains.length, 9, '产业骨架应包含九大板块');

for (const id of ['dram', 'nand-flash', 'enterprise-ssd', 'storage-systems']) {
  assert.ok(data.nodes.some((node) => node.id === id), `缺少关键存储节点 ${id}`);
}

for (const [name, records] of Object.entries({
  domain: data.domains,
  node: data.nodes,
  relationship: data.relationships,
  company: data.companies,
})) {
  const ids = records.map((record) => record.id);
  assert.equal(new Set(ids).size, ids.length, `${name} 存在重复 ID`);
}

const nodeIds = new Set(data.nodes.map((node) => node.id));
for (const relation of data.relationships) {
  assert.ok(nodeIds.has(relation.from), `关系 ${relation.id} 的上游节点不存在`);
  assert.ok(nodeIds.has(relation.to), `关系 ${relation.id} 的下游节点不存在`);
}

const removedPrivateCompanies = new Set([
  'C-shudu-tech',
  'C-hongjun-microelectronics',
  'C-shuhang-intelligent',
]);
assert.ok(
  data.companies.every((company) => !removedPrivateCompanies.has(company.id)),
  '正式公司数据不得包含三家非上市公司',
);
assert.ok(data.companies.length >= 80, '全球上市公司目录应具备跨市场基础覆盖');

for (const company of data.companies) {
  assert.ok(company.ticker, `${company.name} 缺少证券代码`);
  assert.ok(company.exchange, `${company.name} 缺少交易所`);
  assert.ok(company.nodeIds?.length, `${company.name} 未关联产业节点`);
  assert.ok(
    company.nodeIds.every((id) => nodeIds.has(id)),
    `${company.name} 关联了不存在的产业节点`,
  );
}

console.log(
  `catalog: ${data.domains.length} domains, ${data.nodes.length} nodes, ` +
    `${data.relationships.length} relationships, ${data.companies.length} companies`,
);
