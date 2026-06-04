# 07 Agent Loop

## 你会学到什么

- Agent loop 为什么是“模型决策、工具执行、观察回填、继续决策”的循环。
- `AgentAction`、`AgentStep`、`AgentFinish` 分别表达什么状态。
- `AgentActionMessageLog` 为什么对 chat model 很重要。
- `create_agent` 为什么返回 compiled graph，而不是一个普通函数。
- 如何把 Runnable、Message、Tool、ChatModel 串成最小 Agent。

## AI 概念从零解释

普通 LLM 调用通常是：

```text
用户输入 -> 模型 -> 最终回答
```

Agent 调用更像：

```text
用户输入
  -> 模型判断要不要调用工具
  -> 如果需要，框架执行工具
  -> 工具结果作为观察回到模型
  -> 模型继续判断
  -> 直到最终回答或达到停止条件
```

这个循环让模型可以借助外部工具完成自己不能直接完成的事情，比如查代码、读文件、调用 API、执行计算。

## 为什么工程上需要这个抽象

Agent loop 至少需要解决：

- 如何表示“模型要执行的动作”。
- 如何执行动作并保存观察结果。
- 如何把动作和观察重新变成消息历史。
- 如何判断停止条件。
- 如何限制最大轮数，避免无限循环。
- 如何处理工具错误、模型解析错误和中间状态。
- 如何接入 tracing、checkpoint、human-in-the-loop。

LangChain Core 保留了经典 agent schema，LangChain v1 的 `create_agent` 则更偏 graph/workflow 方式，把 agent 编译成可运行的状态图。

## 最小心智模型

```python
messages = [HumanMessage("What's the weather?")]

for _ in range(max_steps):
    ai = model.invoke(messages, tools=tool_schemas)
    messages.append(ai)

    if not ai.tool_calls:
        return ai.content

    for call in ai.tool_calls:
        tool = tools[call["name"]]
        observation = tool.invoke(call)
        messages.append(ToolMessage(
            content=str(observation),
            tool_call_id=call["id"],
        ))
```

这个伪代码就是最小 Agent loop。真实 LangChain 会把这件事拆成 message schema、tool schema、callback/tracing、state graph、middleware、checkpoint 等层。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- agent flow docstring: `libs/core/langchain_core/agents.py:15`
- `AgentAction`: `libs/core/langchain_core/agents.py:44`
- `AgentActionMessageLog`: `agents.py:105`
- `AgentStep`: `agents.py:131`
- `AgentFinish`: `agents.py:146`
- action to messages: `agents.py:191`
- observation to messages: `agents.py:209`
- `create_agent`: `libs/langchain_v1/langchain/agents/factory.py:696`
- compiled graph return: `factory.py:1670`

## 源码阅读路径

1. 先看 `agents.py` 顶部 docstring：`agents.py:15` 到 `agents.py:24`，它直接描述 agent 基本循环。
2. 看 `AgentAction`：`agents.py:44`，理解 tool、tool_input、log。
3. 看 `AgentActionMessageLog`：`agents.py:105`，理解 chat model 下为什么需要保留 message log。
4. 看 `AgentStep`：`agents.py:131`，理解 action 和 observation 如何配对。
5. 看 `AgentFinish`：`agents.py:146`，理解停止后的返回值。
6. 看 `_convert_agent_action_to_messages` 和 `_convert_agent_observation_to_messages`。
7. 看 v1 `create_agent`：`factory.py:696`，理解它创建的是 agent graph。
8. 看返回处 `graph.compile(...).with_config(config)`：`factory.py:1670`。

## 核心实体和关系

- `AgentAction`：模型提出的工具调用请求。
- `AgentActionMessageLog`：带原始 chat messages 的 action。
- `AgentStep`：一次 action 执行后的 observation。
- `AgentFinish`：达到停止条件后的最终返回。
- `AIMessage.tool_calls`：现代 tool calling 中模型表达动作的常见载体。
- `ToolMessage`：工具结果回填消息。
- `create_agent`：生成可循环调用模型和工具的 compiled graph。

## 关键 claims 与 evidence

- `claim-agent-loop-uses-action-observation-finish`：LangChain 的 agent loop 数据结构围绕 action、observation 和 finish 建模，v1 的 create_agent 将模型、工具和中间件编译成 graph。证据：`ev-agent-action`、`ev-agent-step`、`ev-create-agent`、`ev-create-agent-compiled-graph`。
- `agents.py` docstring 明确描述 agent 基本循环：LLM 请求 action、执行工具、返回 observation、达到停止条件后返回最终值。证据：`agents.py:15` 到 `agents.py:24`。
- `AgentAction` 包含 `tool`、`tool_input`、`log`。证据：`agents.py:51` 到 `agents.py:58`。
- `AgentStep` 把 `action` 和 `observation` 配对。证据：`agents.py:131` 到 `agents.py:143`。
- `create_agent` 创建循环调用工具直到停止条件的 agent graph。证据：`factory.py:716`。
- `create_agent` 最终返回 compiled graph，并挂上 config。证据：`factory.py:1670` 到 `factory.py:1683`。

## 相关测试证据

- `ev-test-agent-create-agent-tool-runtime`：`libs/langchain_v1/tests/unit_tests/agents/test_injected_runtime_create_agent.py:36-81` 验证 `create_agent` 生成的 agent 可以接收 `HumanMessage`，让模型产出 tool call，执行工具，回填 `ToolMessage`，并向工具注入 runtime/state/config。
- `ev-test-agent-middleware-tools-node`：`libs/langchain_v1/tests/unit_tests/agents/middleware/core/test_tools.py:101-123` 验证 middleware 可以改写 tools node 的可用工具集合，agent invoke 后实际产生对应 `ToolMessage`。

这些测试把抽象的 action / observation / finish 落到现代 v1 compiled graph 行为：模型节点给出工具调用，工具节点执行，消息状态继续驱动下一轮。

## 真实 compiled graph 执行追踪

本课额外追踪了一次真实测试用例中的 compiled graph 行为，记录在 `raw/source-notes/agent-loop-compiled-graph-trace.md`。核心路径如下：

1. `create_agent(...)` 接收 `FakeToolCallingModel`、`runtime_tool` 和 `system_prompt`，返回可 `invoke` 的 compiled graph。
2. 输入 `{"messages": [HumanMessage("Test")]}` 进入 graph state。
3. model node 产出 `AIMessage(tool_calls=[{"name": "runtime_tool", "args": {"x": 42}, "id": "call_123"}])`。
4. tools node 根据 `tool_call_id` 分发到 `runtime_tool`，同时注入 runtime/state/config。
5. 工具返回 `Processed 42`，graph 生成 `ToolMessage(content="Processed 42", tool_call_id="call_123")`。
6. 消息历史继续进入下一轮模型调用；第二次模型没有 tool calls，循环停止并返回最终 `messages`。

这条路径说明：v1 Agent Loop 的“循环”不是写在一个显眼的 while 里，而是被编译进 graph 的节点和边中；停止条件来自 model 输出是否继续包含 tool calls，以及 graph 的递归限制。

## 真实源码解释

`langchain_core/agents.py` 顶部 docstring 是这课最好的概念入口。它把 agent 描述为：语言模型选择一系列动作；给定 prompt，agent 用 LLM 请求一个动作；框架执行动作并得到观察；观察返回 LLM；达到停止条件后返回最终值。

`AgentAction` 是“动作请求”，不是动作结果。它有 `tool`、`tool_input` 和 `log`。`log` 的注释很有价值：它可以审计模型为什么预测这个 tool/input，也可以在后续迭代中展示模型之前的想法。

`AgentActionMessageLog` 继承 `AgentAction`，额外保存 `message_log`。这是为了 chat model 场景：如果模型原始输出是 messages，那么只保留 `(tool, tool_input)` 可能无法完整重建模型当时说了什么。

`AgentStep` 是执行后的结果，它把 `AgentAction` 和 `observation` 配在一起。它的 `messages` property 会把 observation 转成 message，让后续模型继续看到工具结果。

`AgentFinish` 表示停止条件后的最终返回。它不是“某次工具执行结束”，而是整个 agent loop 结束。

LangChain v1 的 `create_agent` 已经不是简单 while loop 函数。它的签名接收 model、tools、system_prompt、middleware、response_format、state_schema、checkpointer、store、interrupt_before/after 等参数，最终返回 `graph.compile(...).with_config(config)`。这说明复杂 Agent 正在走向 workflow graph，而不是单个循环函数。

## 设计取舍

收益：

- action、observation、finish 把 agent 中间状态显式化。
- message log 让 chat model 的原始推理上下文可重建。
- graph 形式更适合 middleware、checkpoint、human-in-the-loop 和中断恢复。
- Tool、Message、ChatModel、Callback 能在同一个 loop 中协作。

成本：

- 初学者需要同时理解老式 agent schema 和 v1 graph agent。
- 简单 while loop 的直觉很清楚，但真实工程会被 middleware、state、checkpoint 拉复杂。
- action/observation 与现代 `AIMessage.tool_calls` / `ToolMessage` 之间存在概念映射，需要跨版本理解。
- Agent loop 很容易无限循环，必须有停止条件和递归/步数限制。

## 和 Java 后端经验类比

可以把 Agent loop 类比成一个状态机或工作流引擎：

- `AgentAction` 像 command。
- `BaseTool` 像 command handler。
- `AgentStep` 像 command 执行后的 event。
- `messages` 像 append-only event log。
- `AgentFinish` 像 terminal state。
- `create_agent` 返回的 compiled graph 像 workflow definition 编译后的 runtime。

但 Agent loop 的特殊性在于：下一步由模型根据上下文生成，不是由你完全写死的业务规则决定。

## 容易误解的点

- 误解 1：Agent 就是一次模型调用。实际 Agent 是循环。
- 误解 2：AgentAction 是工具结果。实际它是模型提出的动作请求。
- 误解 3：ToolMessage 和 AgentStep 完全等价。它们在不同层表达“观察结果”，但一个是 message，一个是 agent schema。
- 误解 4：新版 LangChain agent 只是旧 AgentExecutor 改名。v1 `create_agent` 已经明显走向 graph 编排。
- 误解 5：模型会自动可靠停止。实际必须有停止条件、递归限制和错误处理。

## 自测题

见 `../quizzes/07-agent-loop.quiz.md`。

## 掌握度验证

见 `../mastery/07-agent-loop.mastery.md`。

## 最小复刻任务

见 `../labs/07-mini-agent-loop/README.md`。

## 学完标准

你应该能不看笔记解释：

- Agent loop 的四步：决策、行动、观察、继续或结束。
- `AgentAction`、`AgentStep`、`AgentFinish` 的区别。
- message schema 和 tool interface 在 Agent loop 中如何协作。
- `create_agent` 为什么返回 compiled graph。
- 如何实现一个最小可运行的 tool calling loop。

