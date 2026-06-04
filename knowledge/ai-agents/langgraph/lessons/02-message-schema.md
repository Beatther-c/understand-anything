# 状态与消息：TypedDict、Reducer 与 MessagesState

## 你会学到什么

- 用工程视角解释 LangGraph 的核心抽象：MessagesState, add_messages, Overwrite。
- 从源码入口 `libs/langgraph/langgraph/graph/message.py` 追踪到测试证据，理解它解决的真实问题。
- 把本课概念复刻成一个最小实验，并能说明它在生产 Agent 中的边界。

## AI 概念从零解释

状态不是一个普通 dict；每个字段可以有合并规则。消息字段通常用 reducer 追加、覆盖或按 id 更新。

如果把一次 LLM 调用看成普通 RPC，Agent 就会显得神秘；但 LangGraph 的观点更像“长期运行的工作流”。LLM 只是节点之一，状态、边、工具、恢复点和事件流共同决定系统行为。本课的核心是：MessagesState, add_messages, Overwrite 如何把不稳定的模型行为包进稳定的软件结构。

## 为什么工程上需要这个抽象

多节点并发写入时必须有确定性合并策略，否则同一 super-step 的两个节点会把状态写乱。

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

本课在这个循环中关注：`State = {messages: Annotated[list, add_messages]}；node -> partial update；reducer(old, update) -> next`。

## Source entry points

- repo: `langchain-ai/langgraph`
- commit: `83dd61feaca993d2ee428706ad04c869895ce400`
- scope: `libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py`
- primary path: `libs/langgraph/langgraph/graph/message.py`
- primary symbol: `MessagesState`
- related symbols: `MessagesState, add_messages, Overwrite`
- previous lesson: LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph
- next lesson: 节点函数即提示装配层：把业务上下文变成模型输入

## 源码阅读路径

1. 先读 `libs/langgraph/langgraph/graph/message.py` 中的 `MessagesState`，只标记输入参数、返回值和它读写的状态。
2. 再读本课 evidence 中的测试文件，观察测试如何构造图、输入和断言。
3. 最后回到源码，把测试中的断言映射到具体分支：错误处理、状态合并、路由、持久化或事件输出。

## 核心 entities 与 relations

- entity: `lesson:02-message-schema`，课程单元。
- entity: `concept:02-message-schema`，源码概念 `MessagesState, add_messages, Overwrite`。
- relation: 本课概念与前后课程的依赖关系见 `graph/relations.json`。

## 关键 claims 与 evidence

- claim: `claim-02-message-schema`，MessagesState 通过预定义 messages 字段和 add_messages reducer 支撑对话状态的增量合并。

- `ev-messages-state-code`: `libs/langgraph/langgraph/graph/message.py:372`，MessagesState 定义 messages 字段并绑定 add_messages reducer。
- `ev-add-messages-code`: `libs/langgraph/langgraph/graph/message.py:31`，add_messages 负责合并消息、按 id 更新以及处理消息格式。
- `ev-test-messages-state`: `libs/langgraph/tests/test_messages_state.py:1`，消息状态测试覆盖 TypedDict/Pydantic 状态和消息合并。
- `ev-test-channels-overwrite`: `libs/langgraph/tests/test_channels.py:497`，Overwrite 测试验证 reducer 可被显式覆盖且保持 dict 形状。

## 相关测试证据

- `ev-test-messages-state`: `libs/langgraph/tests/test_messages_state.py:1`，消息状态测试覆盖 TypedDict/Pydantic 状态和消息合并。
- `ev-test-channels-overwrite`: `libs/langgraph/tests/test_channels.py:497`，Overwrite 测试验证 reducer 可被显式覆盖且保持 dict 形状。

阅读测试时不要只看 test name。建议记录三件事：输入状态是什么、预期输出是什么、测试是否覆盖失败/边界路径。

## 真实源码解释

message.py 把消息合并逻辑封装成 reducer。MessagesState 只是很小的 TypedDict，但它把 messages 字段的合并语义固定下来。测试中对 Pydantic、TypedDict、Overwrite 的覆盖说明：状态字段不是随便 append，而是由 channel/reducer 规则决定。

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

见 `../quizzes/02-message-schema.quiz.md`。

## 掌握度验证

见 `../mastery/02-message-schema.mastery.md`。

## 最小复刻任务

见 `../labs/02-message-types/README.md`。

## 学完标准

- 能不看答案说出 `MessagesState, add_messages, Overwrite` 解决什么工程问题。
- 能在源码中定位本课 primary symbol，并说明至少两个测试如何证明行为。
- 能完成实验，并把自己的实现与 LangGraph 源码设计差异写成 5 条以内的笔记。

