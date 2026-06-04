# Weak Evidence Report

## 当前状态

本轮已经把上一版弱证据中的三项主要缺口补齐到学习包中：

- 生成 `raw/code-graph/libs-core.knowledge-graph.json`，并同步到 `repos/langchain/libs/core/.understand-anything/knowledge-graph.json`。
- 将 Understand Anything deterministic scan/batch 的 388 个 `libs/core` 文件、19 个 batch，与课程实体/关系合并为 UA-compatible 学习图谱。
- 为 `02-message-schema` 到 `08-provider-integration` 均匀补充测试证据。
- 在每节 lesson 中新增 `相关测试证据`。
- 新增 `review/test-evidence-matrix.md`，按课列出测试证据矩阵。
- 新增 `raw/source-notes/agent-loop-compiled-graph-trace.md`，追踪一次 `create_agent` compiled graph 的真实测试执行路径。

## 已解决的弱证据

### Understand Anything 图谱

之前状态：

- 只有 `scan-result.json` 和 `batches.json`。
- 缺少最终可消费的知识图谱文件。

当前状态：

- `raw/code-graph/libs-core.knowledge-graph.json` 已生成。
- 图谱包含 453 个节点、755 条边。
- 节点覆盖 388 个扫描文件、架构 layer、课程实体和关键源码符号。
- 图谱保留 `status` 字段，说明 deterministic scan、semantic batching、LLM entity extraction、architecture assembly 和 graph review 的完成方式。

残留说明：

- 当前环境没有可直接调用的 `/understand` slash-command 子代理会话，所以没有伪称执行了独立 file-analyzer / graph-reviewer 子代理。
- 语义层由当前 Codex 基于 scan/batch、源码证据、测试证据和课程实体编译完成。
- 对学习用途而言，它已经能作为课程图谱和源码导航材料；若以后在支持 slash-command 的环境中运行，可再生成原生 UA session artifacts。

### 测试证据分布

之前状态：

- `01-runnable` 测试证据较充分。
- `02-message-schema` 到 `08-provider-integration` 主要依赖源码证据。

当前状态：

- `evidence.json` 从 35 条扩展到 58 条。
- 每节课至少包含 2 条测试证据。
- `claims.json` 中 02-08 的核心 claim 已追加对应 test evidence id。
- 每节 lesson 已新增 `相关测试证据` 小节。

详见：

- `review/test-evidence-matrix.md`

### Agent Loop compiled graph

之前状态：

- 课程能解释 action / observation / finish 和 `create_agent`，但没有完整追踪一次真实 compiled graph 执行。

当前状态：

- 已追踪 `test_tool_runtime_basic_injection` 中的真实执行路径：
  `HumanMessage -> model node -> AIMessage.tool_calls -> tools node -> ToolMessage -> model node -> finish`
- 已补充 middleware tools node 的测试证据，说明 tools node 可以被 middleware 改写。
- `07-agent-loop.md` 已新增 `真实 compiled graph 执行追踪`。
- `raw/research-packs/07-agent-loop.research.md` 已更新。

详见：

- `raw/source-notes/agent-loop-compiled-graph-trace.md`

## 仍需后续增强

### lab 还不是可运行训练营

`labs/` 当前是完整任务设计和验收标准，但还没有 starter code、tests 和 reference implementation。

如果要升级，应为每个 lab 增加：

- starter code
- tests
- reference implementation
- AI grading rubric

这属于下一阶段“训练营化”，不影响当前课程知识包的完整性。

### LangGraph 可作为第二阶段

`07-agent-loop` 已覆盖 LangChain v1 `create_agent` 的 compiled graph 行为，但 LangGraph 本身的状态图、checkpoint、interrupt、streaming、subgraph 仍值得单独做一个学习包。

## 阅读时的信任顺序

优先信任：

1. `evidence_level: code` 且有具体行号。
2. `evidence_type: test` 且位于 `tests/unit_tests` 或 `standard-tests`。
3. lesson 中引用具体 source path 的解释。
4. `review/open-questions.md` 中仍待追踪的问题。
