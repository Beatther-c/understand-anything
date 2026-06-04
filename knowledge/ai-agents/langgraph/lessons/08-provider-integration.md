# 持久化与远程集成：Checkpoint、Store、SDK 与部署边界

## 你会学到什么

- 用工程视角解释 LangGraph 的核心抽象：BaseCheckpointSaver, InMemorySaver, client.stream。
- 从源码入口 `libs/checkpoint/langgraph/checkpoint/base/__init__.py` 追踪到测试证据，理解它解决的真实问题。
- 把本课概念复刻成一个最小实验，并能说明它在生产 Agent 中的边界。

## AI 概念从零解释

Checkpoint 保存线程的执行状态，Store 保存跨线程记忆，SDK 负责与远程 LangGraph 服务交互。

如果把一次 LLM 调用看成普通 RPC，Agent 就会显得神秘；但 LangGraph 的观点更像“长期运行的工作流”。LLM 只是节点之一，状态、边、工具、恢复点和事件流共同决定系统行为。本课的核心是：BaseCheckpointSaver, InMemorySaver, client.stream 如何把不稳定的模型行为包进稳定的软件结构。

## 为什么工程上需要这个抽象

生产系统需要重试、回放、时间旅行、跨请求记忆、远程运行和并发订阅；这些都要求执行状态与 API 边界可序列化。

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

本课在这个循环中关注：`thread_id + checkpoint_ns -> checkpoint tuple；SDK thread/run stream -> server graph`。

## Source entry points

- repo: `langchain-ai/langgraph`
- commit: `83dd61feaca993d2ee428706ad04c869895ce400`
- scope: `libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py`
- primary path: `libs/checkpoint/langgraph/checkpoint/base/__init__.py`
- primary symbol: `BaseCheckpointSaver`
- related symbols: `BaseCheckpointSaver, InMemorySaver, client.stream`
- previous lesson: Agent Loop：条件边、Command、interrupt 与 ReAct 循环
- next lesson: Capstone

## 源码阅读路径

1. 先读 `libs/checkpoint/langgraph/checkpoint/base/__init__.py` 中的 `BaseCheckpointSaver`，只标记输入参数、返回值和它读写的状态。
2. 再读本课 evidence 中的测试文件，观察测试如何构造图、输入和断言。
3. 最后回到源码，把测试中的断言映射到具体分支：错误处理、状态合并、路由、持久化或事件输出。

## 核心 entities 与 relations

- entity: `lesson:08-provider-integration`，课程单元。
- entity: `concept:08-provider-integration`，源码概念 `BaseCheckpointSaver, InMemorySaver, client.stream`。
- relation: 本课概念与前后课程的依赖关系见 `graph/relations.json`。

## 关键 claims 与 evidence

- claim: `claim-08-provider-integration`，LangGraph 把本地运行时的 checkpoint/store 契约与远程 SDK 契约分离，使同一图可以本地执行或通过服务端线程/运行接口执行。

- `ev-checkpoint-code`: `libs/checkpoint/langgraph/checkpoint/base/__init__.py:1`，checkpoint base 定义保存、读取、列举 checkpoint 的抽象契约。
- `ev-sdk-client-code`: `libs/sdk-py/langgraph_sdk/client.py:1`，Python SDK 提供与远程 LangGraph 服务交互的客户端入口。
- `ev-test-checkpoint`: `libs/langgraph/tests/test_pregel.py:805`，Pregel checkpoint 测试覆盖保存、错误、pending writes 和多线程隔离。
- `ev-test-sdk-stream`: `libs/sdk-py/tests/streaming/test_thread_stream.py:1`，SDK streaming 测试覆盖线程流订阅和远程事件投影。

## 相关测试证据

- `ev-test-checkpoint`: `libs/langgraph/tests/test_pregel.py:805`，Pregel checkpoint 测试覆盖保存、错误、pending writes 和多线程隔离。
- `ev-test-sdk-stream`: `libs/sdk-py/tests/streaming/test_thread_stream.py:1`，SDK streaming 测试覆盖线程流订阅和远程事件投影。

阅读测试时不要只看 test name。建议记录三件事：输入状态是什么、预期输出是什么、测试是否覆盖失败/边界路径。

## 真实源码解释

checkpoint base 定义本地持久化契约，Pregel 测试验证 thread_id、checkpoint_id、pending writes 和错误恢复。SDK 客户端位于独立包，面向远程线程、runs 和 streaming；这说明本地图运行与服务端 API 被清晰分层。

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

见 `../quizzes/08-provider-integration.quiz.md`。

## 掌握度验证

见 `../mastery/08-provider-integration.mastery.md`。

## 最小复刻任务

见 `../labs/08-mini-provider-adapter/README.md`。

## 学完标准

- 能不看答案说出 `BaseCheckpointSaver, InMemorySaver, client.stream` 解决什么工程问题。
- 能在源码中定位本课 primary symbol，并说明至少两个测试如何证明行为。
- 能完成实验，并把自己的实现与 LangGraph 源码设计差异写成 5 条以内的笔记。

