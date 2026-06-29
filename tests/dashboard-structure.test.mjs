import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8');

for (const view of ['overview', 'relations', 'nodes', 'companies']) {
  assert.match(html, new RegExp(`data-view="${view}"`), `缺少 ${view} 导航`);
}

for (const term of ['产业地图', '产业节点', '瓶颈']) {
  assert.match(html, new RegExp(term), `首页缺少“${term}”概念说明`);
}

assert.match(html, /data\/catalog\.js/, '页面应加载统一目录数据');
assert.match(html, /assets\/styles\.css/, '页面应加载独立样式');
assert.match(html, /assets\/app\.js/, '页面应加载独立应用脚本');

console.log('dashboard structure: ok');
