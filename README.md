# Alex's AI CHAIN MAP

面向产业研究的静态知识库，覆盖从材料、半导体和基础设施到模型与行业应用的完整 AI 价值网络。

## 九大板块

1. 材料与关键设备
2. 芯片、IP 与 EDA
3. 制造、封装与测试
4. 计算系统
5. 内存、SSD 与存储系统
6. 网络与高速互连
7. 数据中心能源与冷却
8. 软件、数据与模型
9. 行业与终端应用

“产业节点”是可独立研究的产品、技术或服务。“瓶颈”是节点的属性，用于描述供应集中度、技术壁垒和替代难度，不再把所有节点统称为卡口。

## 页面功能

- **产业全景**：九大板块、覆盖统计和概念说明。
- **关系探索**：查看选中节点的上游投入、核心技术、产出物和下游用途。
- **产业节点**：按板块和关键词检索技术、产品与瓶颈。
- **上市公司**：按板块、地区和交易所筛选全球主要市场上市公司。

## 运行

网页本身没有第三方依赖。在项目目录执行：

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

然后访问 `http://127.0.0.1:4173/dashboard.html`。

## 数据文件

- `data/catalog.js`：产业链与上市公司主数据。
- `data/futu-symbols.json`：公司与富途证券代码的映射及覆盖状态。
- `data/financials.js`：由同步脚本生成、供浏览器读取的富途财务快照。
- `assets/app.js`：页面渲染和交互。
- `assets/styles.css`：响应式视觉样式。
- `tests/`：数据契约、页面结构和应用契约测试。

## 富途财务同步

财务数据的唯一自动化来源是 Futu OpenAPI。先安装并登录 Futu OpenD，保持本机
`127.0.0.1:11111` 可连接，再安装 Python SDK：

```powershell
python -m pip install futu-api
node scripts/build-futu-symbols.mjs
python scripts/sync_futu_financials.py --dry-run
python scripts/sync_futu_financials.py
```

`--dry-run` 不连接 OpenD，只生成“待同步 / 富途不覆盖”等状态。实时同步默认在每家
公司后等待 3.1 秒；必要时可通过 `--request-delay` 调整。富途当前不覆盖的台湾、韩国
及部分欧洲交易所公司仍保留在产业库中，但财务字段显示“未披露”，状态显示“富途不覆盖”。

## 数据政策

上市公司只收录主营或已形成商业收入的直接相关业务，排除概念布局、少量参股和仅使用 AI 的企业。财务数据仅采用 Futu OpenAPI；没有可靠披露、未完成同步或富途不覆盖时明确显示“未披露”，不进行估算。详细规则见 `docs/methodology.md`。

本项目仅供产业研究，不构成投资建议。
