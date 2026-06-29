# 第2层：芯片设计

## 层级概述

芯片设计是AI产业链中附加值最高的环节之一。从GPU、AI加速芯片、ARM服务器CPU到PCIE交换芯片和光通信芯片，每种芯片都需要深厚的设计能力、EDA工具链支持和IP核生态。该层的特点是：研发周期长（2-4年）、流片成本高（先进制程单次流片可达数千万美元）、生态壁垒强（CUDA生态的锁定效应）。

中国芯片设计行业近几年发展迅速，在部分领域（AI加速芯片、ARM服务器CPU、PCIE交换芯片）已有国产替代方案，但在EDA工具和高端GPU领域仍严重依赖美国企业。2022年以来美国对华芯片出口管制不断升级，7nm及以下工艺的芯片设计受到严格限制，直接影响了中国AI芯片的量产能力。

## 覆盖范围

- GPU（图形处理器，AI训练主力芯片）
- AI加速芯片（ASIC/NPU）
- 服务器CPU（x86/ARM架构）
- 存储控制芯片
- 网络交换芯片（PCIE交换芯片、以太网交换芯片）
- 光通信芯片（光模块DSP、激光器驱动、TIA）
- EDA工具（综合、布局布线、仿真）
- IP核（ARM架构授权、PCIe IP、DDR PHY）

## 核心卡口节点

| 序号 | 卡口名称 | 战略重要性 | 国产化状态 | 文档链接 |
|------|---------|-----------|-----------|---------|
| 1 | GPU(图形处理器) | 高 | 部分突破 | [查看](../bottlenecks/02-chip-design/gpu.md) |
| 2 | AI加速芯片(ASIC/NPU) | 高 | 部分突破 | [查看](../bottlenecks/02-chip-design/ai-asic.md) |
| 3 | ARM服务器CPU | 高 | 部分突破 | [查看](../bottlenecks/02-chip-design/arm-server-cpu.md) |
| 4 | 存储控制芯片 | 中 | 已突破 | [查看](../bottlenecks/02-chip-design/storage-controller.md) |
| 5 | PCIE交换芯片 | 高 | 部分突破 | [查看](../bottlenecks/02-chip-design/pcie-switch-chip.md) |
| 6 | 光通信芯片 | 高 | 部分突破 | [查看](../bottlenecks/02-chip-design/optical-comm-chip.md) |
| 7 | EDA工具 | 高 | 尚未突破 | [查看](../bottlenecks/02-chip-design/eda-tools.md) |
| 8 | IP核(ARM/PCIe/DDR) | 高 | 部分突破 | [查看](../bottlenecks/02-chip-design/ip-core.md) |

## 上下游关系

- **上游依赖**: 第3层（晶圆代工，设计需要流片验证）；第1层（封装材料）
- **下游服务**: 第4层（AI软件，芯片需要驱动和框架支持）；第6层（AI服务器，芯片是服务器核心组件）

## 关键公司索引

| 公司 | 涉及卡口 | 国别 |
|------|---------|------|
| NVIDIA | GPU、AI加速芯片、CUDA生态 | 美国 |
| AMD | GPU、服务器CPU | 美国 |
| Intel | 服务器CPU、AI加速芯片 | 美国 |
| Broadcom | PCIE交换芯片、网络芯片 | 美国 |
| ARM | IP核授权 | 英国 |
| Synopsys | EDA工具、IP核 | 美国 |
| Cadence | EDA工具 | 美国 |
| 数渡科技 | PCIE交换芯片 | 中国 |
| 鸿钧微电子 | ARM服务器CPU | 中国 |
| 海光信息 | 服务器CPU | 中国 |
| 寒武纪 | AI加速芯片 | 中国 |
| 华为海思 | AI加速芯片(昇腾)、服务器CPU(鲲鹏) | 中国 |

> 最后更新: 2026-06-28
