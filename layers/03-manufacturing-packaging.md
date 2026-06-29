# 第3层：制造与先进封装

## 层级概述

芯片设计完成后，需要晶圆代工厂将设计图纸转化为物理芯片，再通过先进封装技术将多颗芯片组合成完整系统。该层是AI产业链中资本最密集、技术壁垒最高的环节——一座先进制程晶圆厂的投资通常在150-300亿美元之间。

台积电（TSMC）在7nm及以下先进制程领域占据全球90%以上的市场份额，形成了事实上的技术垄断。中国大陆的中芯国际在14nm及以上制程已具备量产能力，但7nm及以下受设备和材料限制进展缓慢。在先进封装领域，CoWoS和Chiplet技术正成为AI芯片性能提升的关键路径——NVIDIA H100/B200的AI算力很大程度上依赖台积电的CoWoS封装产能。

## 覆盖范围

- 先进制程晶圆代工（7nm及以下）
- 成熟制程晶圆代工（28nm及以上）
- HBM（高带宽内存）制造
- CoWoS / 2.5D先进封装
- Chiplet / 小芯粒封装
- 晶圆级封装（WLP/FOPLP）
- 半导体设备（光刻机、刻蚀机、薄膜沉积、CMP、量测）
- 测试与良率控制（ATE测试、晶圆测试）

## 核心卡口节点

| 序号 | 卡口名称 | 战略重要性 | 国产化状态 | 文档链接 |
|------|---------|-----------|-----------|---------|
| 1 | 先进制程晶圆代工 | 高 | 部分突破 | [查看](../bottlenecks/03-manufacturing/advanced-foundry.md) |
| 2 | 成熟制程晶圆代工 | 中 | 已突破 | [查看](../bottlenecks/03-manufacturing/mature-foundry.md) |
| 3 | HBM高带宽内存 | 高 | 尚未突破 | [查看](../bottlenecks/03-manufacturing/hbm.md) |
| 4 | CoWoS/2.5D先进封装 | 高 | 部分突破 | [查看](../bottlenecks/03-manufacturing/cowos-packaging.md) |
| 5 | Chiplet小芯粒封装 | 高 | 部分突破 | [查看](../bottlenecks/03-manufacturing/chiplet-packaging.md) |
| 6 | 晶圆级封装 | 中 | 已突破 | [查看](../bottlenecks/03-manufacturing/wlp-packaging.md) |
| 7 | 半导体设备 | 高 | 部分突破 | [查看](../bottlenecks/03-manufacturing/semiconductor-equipment.md) |
| 8 | 测试与良率控制 | 中 | 部分突破 | [查看](../bottlenecks/03-manufacturing/testing-yield.md) |

## 上下游关系

- **上游依赖**: 第1层（硅片、光刻胶、电子化学品等基础材料）
- **下游服务**: 第2层（芯片设计公司的流片需求）；第6层（AI服务器需要封装好的芯片和HBM）

## 关键公司索引

| 公司 | 涉及卡口 | 国别 |
|------|---------|------|
| 台积电 (TSMC) | 先进制程代工、CoWoS封装 | 中国台湾 |
| 三星电子 | 先进制程代工、HBM制造 | 韩国 |
| SK海力士 | HBM制造 | 韩国 |
| 中芯国际 | 成熟/先进制程代工 | 中国 |
| 长电科技 | 先进封装 | 中国 |
| 通富微电 | 先进封装 | 中国 |
| ASML | 光刻机 | 荷兰 |
| 应用材料 (Applied Materials) | 沉积/刻蚀设备 | 美国 |
| 泛林 (Lam Research) | 刻蚀设备 | 美国 |
| 北方华创 | 刻蚀/沉积设备 | 中国 |
| 中微公司 | 刻蚀设备 | 中国 |

> 最后更新: 2026-06-28
