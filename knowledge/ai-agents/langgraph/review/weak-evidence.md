# Weak Evidence Report

## 当前状态

本报告记录 LangGraph 学习课程中证据不够充分或需要注意的地方。

## 证据等级说明

所有 claim 当前标注为 `evidence_level: code+tests`，置信度 `high`。这意味着每个核心论断都有源码证据和测试证据支撑。但仍需注意以下局限性。

## 已知局限

### 1. 未运行完整测试套件

- 课程中引用的测试证据基于源码阅读（静态分析），未在真实环境中执行完整测试套件。
- 测试路径和行号基于 commit `83dd61feaca993d2ee428706ad04c869895ce400`，后续版本可能已发生变化。
- 部分测试（如 `test_multiple_interrupt_state_persistence`）涉及复杂的多步交互，仅通过源码阅读确认行为。

### 2. JS/TS SDK 未覆盖

- 本课程仅覆盖 Python 实现（`libs/langgraph`、`libs/prebuilt`、`libs/checkpoint`）。
- LangGraph 的 JS/TS SDK（`@langchain/langgraph`）未纳入分析范围。
- 两端 API 表面相似但实现细节可能存在差异。

### 3. LangGraph Platform / Cloud 未覆盖

- 课程覆盖了 `RemoteGraph` 和 SDK 连接，但未深入 LangGraph Platform 的部署架构。
- LangGraph Cloud 的 assistant API、cron jobs、background runs 等高级功能未纳入。
- 这些属于平台层而非库层，适合作为进阶课程。

### 4. 推断性论述

以下内容基于源码结构推断，而非直接的文档或测试确认：

| 课程 | 推断内容 | 风险 |
|------|----------|------|
| 01 | Pregel 执行引擎的命名来源于 Google Pregel 论文 | 低（代码注释可佐证） |
| 06 | StreamMessagesHandler 与 LangChain callback 系统的兼容性细节 | 中（依赖 langchain-core 版本） |
| 08 | RemoteGraph 的错误重试和连接管理策略 | 中（实现可能依赖 httpx 配置） |

### 5. 测试证据分布

所有 8 个单元 + capstone 均具备至少 2 条测试证据：

| 课程 | 代码证据数 | 测试证据数 | 评估 |
|------|-----------|-----------|------|
| 01-runnable | 2 | 2 | 充分 |
| 02-message-schema | 2 | 2 | 充分 |
| 03-prompt-template | 2 | 2 | 充分 |
| 04-chat-model-adapter | 2 | 2 | 充分 |
| 05-tool-interface | 2 | 2 | 充分 |
| 06-callback-tracing | 2 | 2 | 充分 |
| 07-agent-loop | 4 | 4 | 丰富 |
| 08-provider-integration | 3 | 1 | 测试证据偏少 |
| 99-capstone | 2 | 2 | 充分 |

**注意**：08 课的测试证据仅有 `test_memory_saver` 一条（验证 InMemorySaver 读写），RemoteGraph 的集成测试需要网络环境，未纳入。

## 仍需后续增强

### lab 尚未包含可运行代码

`labs/` 当前是任务设计说明和验收标准，但没有 starter code、tests 和 reference implementation。如要升级为可执行训练营，应为每个 lab 增加：

- starter code（Python 骨架）
- pytest 测试用例
- reference implementation
- AI grading rubric

### Subgraph 和 Map-Reduce 模式未深入覆盖

LangGraph 支持 subgraph（子图嵌套）和 map-reduce 并行模式，当前课程仅在第 7 课提及，未单独成课。这些是进阶主题，适合后续扩展。

## 阅读时的信任顺序

优先信任：

1. `evidence_type: code` 且有具体 path 和 line_range 的证据。
2. `evidence_type: test` 且位于 `tests/` 目录的证据。
3. lesson 中引用具体源码路径的解释。
4. `review/open-questions.md` 中标记的待追踪问题。
