# Alex's AI CHAIN MAP 品牌与富途财务同步设计

## 品牌

浏览器标题、页头主品牌、无障碍标签和目录元信息统一改为 `Alex's AI CHAIN MAP`。页头保留中文副标题“全产业链知识图谱”，其余产业内容和功能不变。

## 数据源政策

富途 OpenAPI 是网站唯一的自动财务数据来源。支持市场为港股、美股、A股、新加坡、马来西亚和日本。台股、韩股和欧洲上市公司继续保留在公司库中，但财务状态显示“富途不覆盖该市场”，所有财务值保持空值。

不得使用 EODHD、FMP、券商网页抓取或模型估算填充财务字段。AI 相关收入占比只有在富途返回明确字段时才写入，否则显示“未披露”。

## 同步架构

- `data/catalog.js` 继续保存公司与产业节点主数据。
- 新增 `data/financials.js`，只保存按公司 ID 索引的财务覆盖状态与最新快照。
- 新增 `data/futu-symbols.json`，把公司 ID 映射为富途代码，例如 `US.NVDA`、`HK.09988`、`SH.688981`、`JP.8035`。
- 新增 `scripts/sync_futu_financials.py`，连接本机 `127.0.0.1:11111` 的 Futu OpenD，获取年度利润表、关键指标和市场快照，并原子化生成 `financials.js`。
- `assets/app.js` 启动时将 `financials.js` 覆盖合并到公司对象，不修改产业目录文件。

## 字段

每家公司财务覆盖记录包含：

- `source`：固定为 `Futu OpenAPI`；
- `status`：`ok`、`unsupported-market`、`symbol-unmapped`、`permission-denied` 或 `fetch-error`；
- `futuCode`；
- `period`、`currency`；
- `revenue`、`grossMargin`、`netIncome`；
- `aiRevenueShare`；
- `marketCap`、`marketCapAsOf`；
- `syncedAt`；
- `message`：用于页面解释未获取原因。

## 页面表现

公司列表增加“数据状态”列。富途成功返回时显示同步日期；富途不覆盖时显示“不覆盖”；没有权限、映射或连接失败时显示具体状态。公司详情展示“财务数据来源：Futu OpenAPI”，并保留未披露值。

## 运行约束

同步需要：

1. Windows 上安装并登录 Futu OpenD；
2. OpenD 在 `127.0.0.1:11111` 运行；
3. Python 环境安装富途 SDK；
4. 富途账号拥有目标市场所需权限。

同步失败不得清空上一份有效的 `financials.js`。日志不得记录富途密码、交易解锁密码或其他敏感信息。

## 测试

- 品牌测试检查浏览器标题、页头和目录元信息。
- 映射测试检查公司 ID、富途代码格式和不支持市场状态。
- 合并测试检查财务覆盖文件不会破坏公司主数据。
- 同步脚本支持 `--dry-run`，在无 OpenD 环境下验证映射和输出结构。
- 浏览器验收检查公司列表状态、详情来源和未披露显示。
