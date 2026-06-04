# 流式输出、调试事件与追踪

## 你会学到什么

- 用工程视角解释 LangGraph 的核心抽象：stream, astream, debug events。
- 从源码入口 `libs/langgraph/langgraph/pregel/main.py` 追踪到测试证据，理解它解决的真实问题。
- 把本课概念复刻成一个最小实验，并能说明它在生产 Agent 中的边界。

## AI 概念从零解释

图运行不是黑盒返回值；Pregel 运行时可以按 values、updates、debug、messages 等模式暴露中间事件。

如果把一次 LLM 调用看成普通 RPC，Agent 就会显得神秘；但 LangGraph 的观点更像“长期运行的工作流”。LLM 只是节点之一，状态、边、工具、恢复点和事件流共同决定系统行为。本课的核心是：stream, astream, debug events 如何把不稳定的模型行为包进稳定的软件结构。

## 为什么工程上需要这个抽象

Agent 的失败常发生在中间步骤。流式事件、checkpoint 事件和 tracing 让工程师能定位是哪一步、哪个节点、哪个工具导致偏差。

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

本课在这个循环中关注：`graph.stream(input, stream_mode=[...]) -> event chunks -> tracer/debug UI`。

## Source entry points

- repo: `langchain-ai/langgraph`
- commit: `83dd61feaca993d2ee428706ad04c869895ce400`
- scope: `libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py`
- primary path: `libs/langgraph/langgraph/pregel/main.py`
- primary symbol: `Pregel.stream`
- related symbols: `stream, astream, debug events`
- previous lesson: 工具接口：ToolNode、InjectedState 与 ToolMessage
- next lesson: Agent Loop：条件边、Command、interrupt 与 ReAct 循环

## 源码阅读路径

1. 先读 `libs/langgraph/langgraph/pregel/main.py` 中的 `Pregel.stream`，只标记输入参数、返回值和它读写的状态。
2. 再读本课 evidence 中的测试文件，观察测试如何构造图、输入和断言。
3. 最后回到源码，把测试中的断言映射到具体分支：错误处理、状态合并、路由、持久化或事件输出。

## 核心 entities 与 relations

- entity: `lesson:06-callback-tracing`，课程单元。
- entity: `concept:06-callback-tracing`，源码概念 `stream, astream, debug events`。
- relation: 本课概念与前后课程的依赖关系见 `graph/relations.json`。

## 关键 claims 与 evidence

- claim: `claim-06-callback-tracing`，Pregel.stream/astream 提供多种 stream_mode，使调用方可以观察值、更新、消息、debug 和 checkpoint 事件。

- `ev-pregel-stream-code`: `libs/langgraph/langgraph/pregel/main.py:1`，Pregel 主运行时提供 invoke/stream/astream 等执行入口。
- `ev-debug-code`: `libs/langgraph/langgraph/pregel/debug.py:1`，debug 模块组织任务、写入、checkpoint 等调试事件。
- `ev-test-stream-events`: `libs/langgraph/tests/test_stream_events_v3.py:1`，stream events v3 测试覆盖事件结构和生命周期。
- `ev-test-debug-checkpoints`: `libs/langgraph/tests/test_pregel.py:4359`，debug retry 测试验证 checkpoint 事件与历史状态一致。

## 相关测试证据

- `ev-test-stream-events`: `libs/langgraph/tests/test_stream_events_v3.py:1`，stream events v3 测试覆盖事件结构和生命周期。
- `ev-test-debug-checkpoints`: `libs/langgraph/tests/test_pregel.py:4359`，debug retry 测试验证 checkpoint 事件与历史状态一致。

阅读测试时不要只看 test name。建议记录三件事：输入状态是什么、预期输出是什么、测试是否覆盖失败/边界路径。

## 真实源码解释

Pregel 的 stream/astream 不是只返回最终状态，而是按 stream mode 发出事件。debug 模块把任务、写入和 checkpoint 组织成可观测事件。测试把事件与状态历史比对，证明事件不是纯日志，而是可核验的执行证据。

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

见 `../quizzes/06-callback-tracing.quiz.md`。

## 掌握度验证

见 `../mastery/06-callback-tracing.mastery.md`。

## 最小复刻任务

见 `../labs/06-mini-callback-tracer/README.md`。

## 学完标准

- 能不看答案说出 `stream, astream, debug events` 解决什么工程问题。
- 能在源码中定位本课 primary symbol，并说明至少两个测试如何证明行为。
- 能完成实验，并把自己的实现与 LangGraph 源码设计差异写成 5 条以内的笔记。

