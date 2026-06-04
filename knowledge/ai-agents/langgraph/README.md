# LangGraph 源码学习课程

> 从源码出发，系统学习 LangGraph 的工程设计与 Agent 编排模式。

## 项目信息

| 项目 | 值 |
|------|-----|
| 仓库 | langchain-ai/langgraph |
| Commit | 83dd61feaca993d2ee428706ad04c869895ce400 |
| 源码范围 | libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py |
| 读者画像 | 有经验的后端工程师，正在系统学习 LLM/Agent 工程 |
| 课程单元 | 8 个核心课程 + 1 个综合项目 |

## 如何开始

1. 打开 `learning.html` 或在 GitHub Pages 上访问交互式学习页面
2. 按照 `learning-path.md` 的顺序学习
3. 每完成一课，做 quiz 自测，通过 mastery 检查
4. 完成 labs/ 中的最小复刻实验巩固理解

## 目录结构

- `graph/`：机器可读的知识图谱数据（entities、relations、claims、evidence、learning-map）。
- `lessons/`：8 节课程化学习材料，每课聚焦一个核心机制。
- `quizzes/`：每课自测题 + 综合终审 quiz。
- `mastery/`：掌握度验证任务，包含复述、源码定位、调用链重建等。
- `labs/`：8 个 mini lab + 1 个综合 capstone 复刻实验。
- `raw/`：工具产物和 research pack 原始数据。
- `review/`：AI 自检报告、弱证据报告、测试矩阵和开放问题。
- `progress/`：学习进度记录和注释。
- `wiki/`：知识库页面。
- `learning.html`：交互式学习入口页面。

## 学习方法

**从图到代码**：每课先建立心智模型（学习目标、概念地图），再进入源码定位关键符号和执行路径。LangGraph 的核心设计围绕"状态图编排"展开——理解 StateGraph → Channel → Node → Edge → Pregel 执行引擎 这条主线，后续 ToolNode、条件路由、interrupt、checkpoint 都是在此基础上的扩展。

**证据驱动**：每个核心论断（claim）都绑定了源码证据和测试证据。学习时务必对照 `graph/evidence.json` 中的文件路径和行号，在 `repos/langgraph` 中阅读真实代码。如果你发现某个论断缺少测试证据，请参考 `review/weak-evidence.md` 了解已知局限。

**做中学**：阅读源码之后，完成 `labs/` 中对应的最小复刻实验。实验不要求完整实现 LangGraph 功能，而是要求你用最少代码复现核心机制（如状态聚合、条件路由、中断恢复），从而验证你对源码的理解是否到位。
