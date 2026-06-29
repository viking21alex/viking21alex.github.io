# 第4层：基础软件与工具链

## 层级概述

硬件再好，如果软件生态跟不上也无法发挥效能。第4层覆盖AI计算从底层驱动到高层框架的完整软件栈。该层的关键特点是：生态锁定效应极强——NVIDIA的CUDA生态经过15年积累，已成为AI训练的事实标准，任何挑战者都需要跨越"鸡与蛋"困境（没有软件生态就没有用户，没有用户就不会有软件生态）。

中国在深度学习框架（PaddlePaddle、MindSpore）、推理引擎（vLLM、TGI的国产优化版本）和分布式训练框架方面已有积累，但在AI编译器（与TensorRT对标）和GPU驱动兼容层（非NVIDIA硬件的软件栈）方面仍存在明显差距。

## 覆盖范围

- AI操作系统/训练调度系统
- GPU驱动与CUDA兼容层
- AI编译器（TVM、TensorRT、MLIR）
- 深度学习框架（PyTorch、TensorFlow、MindSpore、PaddlePaddle）
- 容器与编排（K8s + GPU调度插件）
- 分布式训练框架（Megatron、DeepSpeed）
- 推理服务框架（vLLM、TGI、Triton）

## 核心卡口节点

| 序号 | 卡口名称 | 战略重要性 | 国产化状态 | 文档链接 |
|------|---------|-----------|-----------|---------|
| 1 | AI训练调度系统 | 高 | 已突破 | [查看](../bottlenecks/04-software/ai-os.md) |
| 2 | GPU驱动与CUDA兼容层 | 高 | 部分突破 | [查看](../bottlenecks/04-software/cuda-compat.md) |
| 3 | AI编译器 | 高 | 部分突破 | [查看](../bottlenecks/04-software/ai-compiler.md) |
| 4 | 深度学习框架 | 高 | 已突破 | [查看](../bottlenecks/04-software/dl-framework.md) |
| 5 | 分布式训练框架 | 中 | 已突破 | [查看](../bottlenecks/04-software/distributed-training.md) |
| 6 | 推理服务引擎 | 高 | 已突破 | [查看](../bottlenecks/04-software/inference-engine.md) |
| 7 | 容器与GPU调度 | 中 | 已突破 | [查看](../bottlenecks/04-software/container-gpu.md) |

## 上下游关系

- **上游依赖**: 第2层（芯片设计，驱动和编译器需要适配具体芯片架构）
- **下游服务**: 第5层（AI模型，框架是模型训练和推理的基础设施）；第6层（算力基础设施，分布式训练需要数据中心支持）

## 关键公司索引

| 公司 | 涉及卡口 | 国别 |
|------|---------|------|
| NVIDIA | CUDA、TensorRT、GPU驱动 | 美国 |
| Meta | PyTorch | 美国 |
| Google | TensorFlow、JAX、TPU生态 | 美国 |
| Microsoft | DeepSpeed | 美国 |
| OpenAI | Triton推理引擎 | 美国 |
| 华为 | MindSpore、CANN | 中国 |
| 百度 | PaddlePaddle | 中国 |

> 最后更新: 2026-06-28
