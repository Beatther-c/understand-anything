# LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph

## 你会学到什么

- 用工程视角解释 LangGraph 的核心抽象：StateGraph, CompiledStateGraph。
- 从源码入口 `libs/langgraph/langgraph/graph/state.py` 追踪到测试证据，理解它解决的真实问题。
- 把本课概念复刻成一个最小实验，并能说明它在生产 Agent 中的边界。

## AI 概念从零解释

把图看成一个可调用程序：输入状态进入 START，节点函数写入局部更新，运行时把更新合并成下一轮状态，直到 END。

如果把一次 LLM 调用看成普通 RPC，Agent 就会显得神秘；但 LangGraph 的观点更像“长期运行的工作流”。LLM 只是节点之一，状态、边、工具、恢复点和事件流共同决定系统行为。本课的核心是：StateGraph, CompiledStateGraph 如何把不稳定的模型行为包进稳定的软件结构。

## 为什么工程上需要这个抽象

Agent 不是单次函数调用，而是可暂停、可恢复、可观测的状态机。可执行图让工程师把复杂流程拆成节点、边和稳定的调用入口。

对后端工程师可以类比为：普通函数像同步 controller；LangGraph 图像可恢复 saga/workflow；checkpoint 像持久化执行日志；stream/debug 像领域事件与 tracing。

## 最小心智模型

```python
# 伪代码：不是逐字源码，而是本课抽象的最小模型
state = initial_input
while current_node != END:
    update = current_node.run(state, runtime)
    state = merge_by_schema(state, update)
    current_node = route_by_edges(state)
return project_output(state)
```

本课在这个循环中关注：`GraphBuilder.add_node(fn) -> add_edge(A, B) -> compile() -> Pregel.invoke(input)`。

## Source entry points

- repo: `langchain-ai/langgraph`
- commit: `83dd61feaca993d2ee428706ad04c869895ce400`
- scope: `libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py`
- primary path: `libs/langgraph/langgraph/graph/state.py`
- primary symbol: `StateGraph.compile`
- related symbols: `StateGraph, CompiledStateGraph`
- previous lesson: 无
- next lesson: 状态与消息：TypedDict、Reducer 与 MessagesState

## 源码阅读路径

1. 先读 `libs/langgraph/langgraph/graph/state.py` 中的 `StateGraph.compile`，只标记输入参数、返回值和它读写的状态。
2. 再读本课 evidence 中的测试文件，观察测试如何构造图、输入和断言。
3. 最后回到源码，把测试中的断言映射到具体分支：错误处理、状态合并、路由、持久化或事件输出。

## 核心 entities 与 relations

- entity: `lesson:01-runnable`，课程单元。
- entity: `concept:01-runnable`，源码概念 `StateGraph, CompiledStateGraph`。
- relation: 本课概念与前后课程的依赖关系见 `graph/relations.json`。

## 关键 claims 与 evidence

- claim: `claim-01-runnable`，StateGraph.compile 会把声明式节点/边转换为可 invoke/stream 的 CompiledStateGraph，而不是直接执行节点函数。

- `ev-stategraph-code`: `libs/langgraph/langgraph/graph/state.py:130`，StateGraph 是有状态图构建器，接收 state_schema/context_schema/input/output 等图定义。
- `ev-compiled-code`: `libs/langgraph/langgraph/graph/state.py:1164`，compile 接收 checkpointer/store/interrupt/cache/debug 等参数并产出 CompiledStateGraph。
- `ev-test-state-basic`: `libs/langgraph/tests/test_state.py:1`，状态图测试覆盖基础节点、边和状态更新行为。
- `ev-test-runnable`: `libs/langgraph/tests/test_runnable.py:1`，Runnable 互操作测试证明编译图可作为可调用对象使用。

## 相关测试证据

- `ev-test-state-basic`: `libs/langgraph/tests/test_state.py:1`，状态图测试覆盖基础节点、边和状态更新行为。
- `ev-test-runnable`: `libs/langgraph/tests/test_runnable.py:1`，Runnable 互操作测试证明编译图可作为可调用对象使用。

阅读测试时不要只看 test name。建议记录三件事：输入状态是什么、预期输出是什么、测试是否覆盖失败/边界路径。

## 真实源码解释

StateGraph 收集节点、边、schema 和运行参数；compile 阶段把这些声明转换为 CompiledStateGraph。CompiledStateGraph 继承 Pregel 能力，因此用户看到的是 invoke/stream 这样的执行入口，而构建期对象本身不直接跑节点。

## 设计取舍

- 显式图结构让流程更可审查，但需要学习节点、边、状态和运行时的词汇。
- 类型 schema 能提前暴露状态合并错误，但动态消息和工具调用仍需要运行时测试兜底。
- 运行时事件和 checkpoint 增加复杂度，但换来可恢复、可观测和可回放的生产能力。

## Java/backend 类比

可以把 LangGraph 想成 Temporal/Cadence 风格的工作流内核加上 LLM 节点：节点像 activity，状态像 workflow state，checkpoint 像 event history，ToolNode 像受控外部副作用适配器，Command/interrupt 像工作流信号和人工审批。

## 常见误解

- 误解：LangGraph 是“画图工具”。更准确地说，它是可执行状态图运行时。
- 误解：Agent loop 必须手写 while。LangGraph 倾向用条件边、Command 和节点返回值表达循环。
- 误解：测试只需要 mock 模型输出。实际还要测试状态合并、工具注入、checkpoint、stream 事件和恢复路径。

## 自测题

见 `../quizzes/01-runnable.quiz.md`。

## 掌握度验证

见 `../mastery/01-runnable.mastery.md`。

## 最小复刻任务

见 `../labs/01-mini-runnable/README.md`。

## 学完标准

- 能不看答案说出 `StateGraph, CompiledStateGraph` 解决什么工程问题。
- 能在源码中定位本课 primary symbol，并说明至少两个测试如何证明行为。
- 能完成实验，并把自己的实现与 LangGraph 源码设计差异写成 5 条以内的笔记。

