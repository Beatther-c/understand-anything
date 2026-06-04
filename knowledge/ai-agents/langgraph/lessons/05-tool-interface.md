# 工具接口：ToolNode、InjectedState 与 ToolMessage

## 你会学到什么

- 用工程视角解释 LangGraph 的核心抽象：ToolNode, tools_condition, InjectedState, InjectedStore。
- 从源码入口 `libs/prebuilt/langgraph/prebuilt/tool_node.py` 追踪到测试证据，理解它解决的真实问题。
- 把本课概念复刻成一个最小实验，并能说明它在生产 Agent 中的边界。

## AI 概念从零解释

工具调用是模型提出的结构化动作，ToolNode 把动作解析、注入隐藏参数、执行工具，再把结果写回消息流。

如果把一次 LLM 调用看成普通 RPC，Agent 就会显得神秘；但 LangGraph 的观点更像“长期运行的工作流”。LLM 只是节点之一，状态、边、工具、恢复点和事件流共同决定系统行为。本课的核心是：ToolNode, tools_condition, InjectedState, InjectedStore 如何把不稳定的模型行为包进稳定的软件结构。

## 为什么工程上需要这个抽象

让 LLM 只负责选择工具和公开参数，权限、状态、存储和运行时对象由系统注入，能降低提示泄露和参数伪造风险。

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

本课在这个循环中关注：`AIMessage.tool_calls -> ToolNode -> tool(args + injected) -> ToolMessage`。

## Source entry points

- repo: `langchain-ai/langgraph`
- commit: `83dd61feaca993d2ee428706ad04c869895ce400`
- scope: `libs/langgraph, libs/prebuilt, libs/checkpoint, libs/sdk-py`
- primary path: `libs/prebuilt/langgraph/prebuilt/tool_node.py`
- primary symbol: `ToolNode`
- related symbols: `ToolNode, tools_condition, InjectedState, InjectedStore`
- previous lesson: 模型适配：把 ChatModel 当成图节点的一部分
- next lesson: 流式输出、调试事件与追踪

## 源码阅读路径

1. 先读 `libs/prebuilt/langgraph/prebuilt/tool_node.py` 中的 `ToolNode`，只标记输入参数、返回值和它读写的状态。
2. 再读本课 evidence 中的测试文件，观察测试如何构造图、输入和断言。
3. 最后回到源码，把测试中的断言映射到具体分支：错误处理、状态合并、路由、持久化或事件输出。

## 核心 entities 与 relations

- entity: `lesson:05-tool-interface`，课程单元。
- entity: `concept:05-tool-interface`，源码概念 `ToolNode, tools_condition, InjectedState, InjectedStore`。
- relation: 本课概念与前后课程的依赖关系见 `graph/relations.json`。

## 关键 claims 与 evidence

- claim: `claim-05-tool-interface`，ToolNode 会识别 AIMessage 中的工具调用，并把 InjectedState/InjectedStore 等系统参数从 LLM 可见 schema 中隔离出来。

- `ev-toolnode-code`: `libs/prebuilt/langgraph/prebuilt/tool_node.py:622`，ToolNode 是执行工具调用的 Runnable 节点。
- `ev-injected-state-code`: `libs/prebuilt/langgraph/prebuilt/tool_node.py:1753`，注入注解让状态和存储在执行期传入工具，且不暴露给模型 schema。
- `ev-test-toolnode`: `libs/prebuilt/tests/test_tool_node.py:1`，ToolNode 测试覆盖工具调用输入、输出和错误处理。
- `ev-test-injected-state`: `libs/prebuilt/tests/test_tool_node.py:1315`，InjectedState/InjectedStore 测试覆盖状态与存储注入。

## 相关测试证据

- `ev-test-toolnode`: `libs/prebuilt/tests/test_tool_node.py:1`，ToolNode 测试覆盖工具调用输入、输出和错误处理。
- `ev-test-injected-state`: `libs/prebuilt/tests/test_tool_node.py:1315`，InjectedState/InjectedStore 测试覆盖状态与存储注入。

阅读测试时不要只看 test name。建议记录三件事：输入状态是什么、预期输出是什么、测试是否覆盖失败/边界路径。

## 真实源码解释

ToolNode 读取最近消息中的 tool_calls，查找对应工具并执行。InjectedState/InjectedStore 标注的参数不会交给模型填写，而是在执行期由系统注入。这种设计把 LLM 可控输入和系统可信上下文拆开。

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

见 `../quizzes/05-tool-interface.quiz.md`。

## 掌握度验证

见 `../mastery/05-tool-interface.mastery.md`。

## 最小复刻任务

见 `../labs/05-mini-tool-calling/README.md`。

## 学完标准

- 能不看答案说出 `ToolNode, tools_condition, InjectedState, InjectedStore` 解决什么工程问题。
- 能在源码中定位本课 primary symbol，并说明至少两个测试如何证明行为。
- 能完成实验，并把自己的实现与 LangGraph 源码设计差异写成 5 条以内的笔记。

