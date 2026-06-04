# 01 LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph

## 你会学到什么

- StateGraph 作为图构建器的 Builder 模式设计思想。
- `compile()` 如何将声明式图定义编译为可执行的 `CompiledStateGraph` 实例。
- `CompiledStateGraph` 继承 `Pregel` 并实现 Runnable 接口（invoke/stream/ainvoke/astream）。
- Pregel 超步模型如何驱动节点调度和 Channel 读写。
- 类比 Java 中 Spring State Machine 的 builder → 可执行实例 模式。

## AI 概念从零解释

LangGraph 的核心设计哲学是"把 AI Agent 的执行逻辑建模为有向图"。如果你做过后端 workflow 引擎（Temporal、Camunda）或者用 Go 写过 DAG 调度器，LangGraph 的 StateGraph 就是类似的东西：

1. **声明阶段**：用 `add_node` / `add_edge` 描述图拓扑（节点和边），此时不执行任何逻辑。
2. **编译阶段**：调用 `compile()` 将声明式定义转换为可执行引擎（类比 `Makefile → make`）。
3. **执行阶段**：对编译产物调用 `invoke()` 或 `stream()`，Pregel 引擎按超步调度节点。

**Pregel 模型类比**：Google Pregel 论文描述的图计算模型是"所有节点在每一超步中并行读取消息、计算、发送消息"。LangGraph 借鉴此思想——每个超步中，就绪节点并行执行，通过 Channel（消息管道）传递状态更新。这和 Java 里的 Event Sourcing 思路相似：不是直接改状态，而是写入 Channel，由 reducer 决定如何聚合。

## 源码阅读路径

| 属性 | 值 |
|------|------|
| repo | langchain-ai/langgraph |
| commit | `83dd61feaca993d2ee428706ad04c869895ce400` |
| scope | `libs/langgraph/langgraph/graph/` |
| primary path | `libs/langgraph/langgraph/graph/state.py` |
| primary symbol | `StateGraph` / `CompiledStateGraph` |

**3 步阅读法**：
1. 从 `StateGraph.__init__` 开始，看它如何初始化 `nodes`、`edges`、`branches` 三个容器。
2. 跳到 `StateGraph.compile()`（L1164-1388），观察验证→创建 Channel→实例化 CompiledStateGraph→绑定节点/边→validate 的完整流程。
3. 看 `CompiledStateGraph`（L1391）的类定义，确认它继承 `Pregel[StateT, ContextT, InputT, OutputT]`，从而拥有 `invoke/stream` 能力。

## 关键 claims 与 evidence

### claim-01-runnable

> StateGraph.compile() 返回 CompiledStateGraph 实例，该实例继承 Pregel 并实现 Runnable 接口的 invoke/stream/ainvoke/astream 方法

**证据支持**：

- **ev-stategraph-compile-code**（`state.py` L1164-1388）：`compile()` 方法验证图结构、解析 channels、创建 `CompiledStateGraph` 实例，最终调用 `compiled.validate()` 返回。关键行为是将 builder 中的 `self.nodes` 和 `self.edges` 逐一 attach 到编译产物。
- **ev-compiled-extends-pregel**（`state.py` L1391-1410）：`class CompiledStateGraph(Pregel[StateT, ContextT, InputT, OutputT])` 明确继承关系，Pregel 基类实现了 Runnable 协议。
- **ev-test-compile-invoke**（`test_pregel.py` L433-462）：测试 `test_invoke_single_process_in_out` 验证 compile→invoke 链路正常工作。
- **ev-test-stream-basic**（`test_pregel.py` L1382-1418）：测试 `test_imp_stream_order` 验证 stream 输出顺序正确。

## 真实源码解释

`StateGraph` 采用经典 Builder 模式：`add_node`/`add_edge` 只是往内部字典写入描述，不做任何执行。`compile()` 是"冻结"操作——验证图连通性、解析 TypedDict 状态为 Channel 映射、将每个节点包装为 `PregelNode`（带有 Channel 订阅信息），最终产出一个不可变的 `CompiledStateGraph`。

`CompiledStateGraph` 继承 `Pregel`，而 `Pregel` 实现了 LangChain Core 的 `Runnable` 接口。这意味着编译后的图可以像任何 LangChain Runnable 一样被调用：`graph.invoke(input)`、`graph.stream(input)`、`await graph.ainvoke(input)`。这是整个框架的"万物皆 Runnable"统一抽象的体现。

设计选择上，compile 阶段会将 `EphemeralValue(START)` 作为输入 Channel 注入，这样外部输入通过 START 通道进入图执行循环，和其他节点间的 Channel 通信使用统一机制。

## 自测题

请前往 `quizzes/01-runnable.quiz.md` 完成自测。

## 掌握度验证

请前往 `mastery/01-runnable.mastery.md` 完成掌握度验证。

## 最小复刻任务

请前往 `labs/01-mini-runnable/` 完成最小复刻任务。

## 学完标准

- 能口述 StateGraph → compile() → CompiledStateGraph → invoke/stream 的完整链路。
- 能解释 CompiledStateGraph 为何继承 Pregel 而非直接实现 Runnable。
- 能说明 compile() 阶段做了哪 5 件核心事情（验证、Channel 解析、实例化、attach 节点/边、validate）。
- 能用 3 行代码写出最简的 StateGraph 声明→编译→执行流程。
