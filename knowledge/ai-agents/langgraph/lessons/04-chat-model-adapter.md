# 模型适配：把 ChatModel 当成图节点的一部分

## 你会学到什么

- 用工程视角解释 LangGraph 的核心抽象：call_model, model.bind_tools, dynamic model。
- 从源码入口 `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py` 追踪到测试证据，理解它解决的真实问题。
- 把本课概念复刻成一个最小实验，并能说明它在生产 Agent 中的边界。

## AI 概念从零解释

模型不是全局魔法；它是节点调用链里的一个可替换组件。节点根据状态调用模型，模型返回 AIMessage 或工具调用请求。

如果把一次 LLM 调用看成普通 RPC，Agent 就会显得神秘；但 LangGraph 的观点更像“长期运行的工作流”。LLM 只是节点之一，状态、边、工具、恢复点和事件流共同决定系统行为。本课的核心是：call_model, model.bind_tools, dynamic model 如何把不稳定的模型行为包进稳定的软件结构。

## 为什么工程上需要这个抽象

生产 Agent 要支持静态模型、动态模型选择、绑定工具、结构化输出和错误重试。适配层让这些变化不破坏图结构。

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

本课在这个循环中关注：`call_model(state) -> model.invoke(messages) -> AIMessage -> route/tool/end`。

## Source entry points

- repo: `langchain-ai/langgraph`
- commit: `83dd61feaca993d2ee428706ad04c869895ce400`
- scope: `libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py`
- primary path: `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py`
- primary symbol: `create_react_agent`
- related symbols: `call_model, model.bind_tools, dynamic model`
- previous lesson: 节点函数即提示装配层：把业务上下文变成模型输入
- next lesson: 工具接口：ToolNode、InjectedState 与 ToolMessage

## 源码阅读路径

1. 先读 `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py` 中的 `create_react_agent`，只标记输入参数、返回值和它读写的状态。
2. 再读本课 evidence 中的测试文件，观察测试如何构造图、输入和断言。
3. 最后回到源码，把测试中的断言映射到具体分支：错误处理、状态合并、路由、持久化或事件输出。

## 核心 entities 与 relations

- entity: `lesson:04-chat-model-adapter`，课程单元。
- entity: `concept:04-chat-model-adapter`，源码概念 `call_model, model.bind_tools, dynamic model`。
- relation: 本课概念与前后课程的依赖关系见 `graph/relations.json`。

## 关键 claims 与 evidence

- claim: `claim-04-chat-model-adapter`，预构建 ReAct agent 会把模型调用封装成图节点，并校验模型绑定工具与传入工具集合的一致性。

- `ev-react-call-model-code`: `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py:560`，ReAct agent 内部模型节点负责调用 chat model 并写回消息。
- `ev-tool-binding-code`: `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py:180`，工具绑定校验逻辑要求模型绑定工具集合与传入工具匹配。
- `ev-test-dynamic-model`: `libs/prebuilt/tests/test_react_agent.py:1565`，动态模型测试覆盖运行时选择模型和静态/动态模型差异。
- `ev-test-model-tool-mismatch`: `libs/prebuilt/tests/test_react_agent.py:329`，测试验证模型已绑定工具与传入工具不一致时会报错。

## 相关测试证据

- `ev-test-dynamic-model`: `libs/prebuilt/tests/test_react_agent.py:1565`，动态模型测试覆盖运行时选择模型和静态/动态模型差异。
- `ev-test-model-tool-mismatch`: `libs/prebuilt/tests/test_react_agent.py:329`，测试验证模型已绑定工具与传入工具不一致时会报错。

阅读测试时不要只看 test name。建议记录三件事：输入状态是什么、预期输出是什么、测试是否覆盖失败/边界路径。

## 真实源码解释

ReAct agent 的模型节点会调用 chat model，并把返回的 AIMessage 写回 messages。工具绑定检查避免出现模型知道一组工具、ToolNode 却执行另一组工具的漂移。动态模型测试说明模型选择可以依赖运行时，而不是固定在图定义时。

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

见 `../quizzes/04-chat-model-adapter.quiz.md`。

## 掌握度验证

见 `../mastery/04-chat-model-adapter.mastery.md`。

## 最小复刻任务

见 `../labs/04-mini-chat-model-adapter/README.md`。

## 学完标准

- 能不看答案说出 `call_model, model.bind_tools, dynamic model` 解决什么工程问题。
- 能在源码中定位本课 primary symbol，并说明至少两个测试如何证明行为。
- 能完成实验，并把自己的实现与 LangGraph 源码设计差异写成 5 条以内的笔记。

