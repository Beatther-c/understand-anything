# 02 Message Schema

## 你会学到什么

- LLM 应用为什么使用 message list，而不是只传一个字符串。
- system / human / ai / tool message 在 Agent 中分别承担什么职责。
- `AIMessage.tool_calls`、`ToolMessage.tool_call_id` 和工具调用闭环是什么关系。
- message schema 如何成为 Agent loop 的状态日志。
- 如何把这套消息模型迁移到自己的 Agent harness。

## AI 概念从零解释

聊天模型的输入通常不是一段无结构文本，而是一组带角色的消息：

```text
SystemMessage: 你是一个谨慎的代码助手
HumanMessage: 请帮我查一下这个函数的作用
AIMessage: 我需要调用 search_code 工具
ToolMessage: search_code 返回了 3 个匹配文件
AIMessage: 根据工具结果给出最终解释
```

这些角色不是 UI 上的装饰，而是模型上下文里的结构信号。`system` 更像运行规则，`human` 是用户意图，`ai` 是模型上一轮输出，`tool` 是外部世界返回的观察结果。

Agent 场景里，message schema 尤其关键。模型不会真的执行函数，它只会输出“我要调用某个工具以及参数是什么”。框架执行工具后，必须把结果作为 `ToolMessage` 放回消息历史，让模型下一轮继续推理。

## 为什么工程上需要这个抽象

如果只用普通字符串，框架很难稳定表达这些信息：

- 哪些内容是系统约束，哪些是用户输入。
- 哪些内容是模型自己生成的中间步骤。
- 哪些内容是工具执行结果。
- 一个工具结果对应哪一次 tool call。
- token usage、provider 原始字段、response metadata 放在哪里。

Message schema 把这些都变成显式字段。它的工程价值类似“事件日志的标准事件类型”：每一轮对话都可以被序列化、反序列化、追踪、回放和传给不同 provider adapter。

## 最小心智模型

可以先用下面的简化结构理解：

```python
class Message:
    def __init__(self, role, content, **metadata):
        self.role = role
        self.content = content
        self.metadata = metadata


messages = [
    Message("system", "You are a coding assistant."),
    Message("human", "Read RunnableSequence."),
    Message("ai", "", tool_calls=[{"id": "call_1", "name": "read_file"}]),
    Message("tool", "class RunnableSequence ...", tool_call_id="call_1"),
    Message("ai", "RunnableSequence chains multiple Runnable steps."),
]
```

LangChain 的真实实现比这个更细：不同 message 是不同类，`AIMessage` 有标准化 tool call 字段，`ToolMessage` 有 `artifact`，`BaseMessage` 有 `additional_kwargs` 和 `response_metadata`。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- base message: `libs/core/langchain_core/messages/base.py:93`
- human message: `libs/core/langchain_core/messages/human.py:9`
- system message: `libs/core/langchain_core/messages/system.py:9`
- ai message: `libs/core/langchain_core/messages/ai.py:160`
- tool message: `libs/core/langchain_core/messages/tool.py:26`

## 源码阅读路径

1. 先看 `BaseMessage`：`base.py:93`，确认 message 是 chat model 的输入和输出。
2. 看 `BaseMessage.content`、`additional_kwargs`、`response_metadata`、`type`：`base.py:103` 到 `base.py:123`。
3. 看 `HumanMessage.type = "human"` 和 `SystemMessage.type = "system"`。
4. 看 `AIMessage`：`ai.py:160`，重点看 `tool_calls`、`invalid_tool_calls`、`usage_metadata`。
5. 看 `ToolMessage`：`tool.py:26`，重点看 `tool_call_id` 和 `artifact`。
6. 回到 Agent loop 时再看 `langchain_core/agents.py` 如何把 action / observation 转成 message。

## 核心实体和关系

- `BaseMessage`：所有消息类型的抽象基类。
- `HumanMessage`：用户消息。
- `SystemMessage`：系统约束消息。
- `AIMessage`：模型输出消息，包含文本、tool calls、usage metadata。
- `ToolMessage`：工具执行结果消息。
- `AIMessage.tool_calls -> BaseTool.invoke`：模型提出结构化工具调用意图。
- `BaseTool.run -> ToolMessage.tool_call_id`：工具结果通过 id 对齐原始调用。

## 关键 claims 与 evidence

- `claim-message-schema-carries-agent-state`：message schema 承载 agent loop 状态。证据：`ev-base-message`、`ev-ai-message-tool-calls`、`ev-tool-message-tool-call-id`。
- `BaseMessage.content` 支持字符串或结构化 content list。证据：`messages/base.py:103`。
- `additional_kwargs` 用于承载 provider 额外 payload，例如模型原始 tool calls。证据：`messages/base.py:106`。
- `AIMessage` 提供标准化 `tool_calls` 和 `usage_metadata`。证据：`messages/ai.py:170`、`messages/ai.py:176`。
- `ToolMessage.tool_call_id` 用来关联 tool call request 和 response。证据：`messages/tool.py:32`、`messages/tool.py:67`。

## 相关测试证据

- `ev-test-message-tool-call-serde`：`tests/unit_tests/test_messages.py:412-433` 验证普通 message 和含 `tool_calls` 的 `AIMessage` 可以往返序列化。
- `ev-test-message-chunk-tool-calls`：`tests/unit_tests/test_messages.py:465-487` 验证流式 chunk 中的 tool call 片段会合并成 `tool_calls`，解析失败的片段进入 `invalid_tool_calls`。
- `ev-test-tool-message-serde-dict`：`tests/unit_tests/test_messages.py:989-1054` 验证 `ToolMessage` 的 `artifact`、`status`、`tool_call_id` 可以序列化和转 dict。

这些测试说明 message schema 不是“文本包装类”，而是 agent loop 能恢复状态、对齐工具调用、回放 provider payload 的协议层。

## 真实源码解释

`BaseMessage` 的 docstring 直接说 messages 是 chat model 的输入和输出。这一点很重要：在 LangChain 里，message 不是前端聊天气泡，而是模型调用协议的核心数据结构。

`content` 的类型是 `str | list[str | dict]`，说明 LangChain 不只支持纯文本，也为更结构化的多模态或 provider payload 留了空间。

`additional_kwargs` 的注释说它保留 message 相关的额外 payload，比如 AI message 中 provider 编码的 tool calls。这意味着 LangChain 同时保留两层信息：一层是标准化字段，另一层是 provider 原始扩展。

`AIMessage` 的定义说明它代表模型输出，并包含 LangChain 标准化字段。`tool_calls` 是解析成功的工具调用，`invalid_tool_calls` 是解析失败的工具调用，`usage_metadata` 是跨模型一致的 token usage 表达。

`ToolMessage` 的 docstring 把 tool call 对齐讲得很清楚：`tool_call_id` 用于把工具请求和工具响应关联起来，尤其是模型可以并行请求多个工具时。如果没有这个 id，框架很难知道某个工具结果应该回到哪次调用。

## 设计取舍

收益：

- 对话状态可以序列化和回放。
- provider adapter 可以把不同 API 格式归一到同一套 message 类型。
- Agent loop 可以通过 message history 表达多轮工具调用。
- tool call 和 tool result 能用 id 精确配对。
- token usage、response headers、logprobs 等 metadata 有稳定位置。

成本：

- 初学者容易觉得 message 类型太多。
- provider 原始字段和 LangChain 标准化字段并存，阅读时要分清层级。
- tool call 的完整闭环需要同时理解 `AIMessage`、`BaseTool`、`ToolMessage` 和 agent loop。

## 和 Java 后端经验类比

可以把 message history 类比成领域事件流：

- `HumanMessage` 像用户请求事件。
- `AIMessage(tool_calls=...)` 像系统生成的 command。
- `ToolMessage` 像 command handler 执行后的 event。
- `SystemMessage` 像策略配置或 request context。

但不要把它简单理解成 DTO。Message 同时是模型上下文、框架状态、tracing 输入和 provider adapter 的边界对象。

## 容易误解的点

- 误解 1：message 只是聊天 UI 的一条气泡。实际它是 chat model 的输入输出协议。
- 误解 2：`AIMessage` 只保存模型文本。实际它还保存 tool calls、invalid tool calls、usage metadata。
- 误解 3：`ToolMessage` 是工具定义。实际它是工具执行后的结果消息。
- 误解 4：`tool_call_id` 可有可无。并行工具调用时，没有它就无法可靠对齐结果。
- 误解 5：system message 总是用户可见。很多应用里它是运行策略，不是普通对话内容。

## 自测题

见 `../quizzes/02-message-schema.quiz.md`。

## 掌握度验证

见 `../mastery/02-message-schema.mastery.md`。

## 最小复刻任务

见 `../labs/02-message-types/README.md`。

## 学完标准

你应该能不看笔记解释：

- 为什么 LLM 应用需要 message list。
- system / human / ai / tool message 的职责差异。
- `AIMessage.tool_calls` 和 `ToolMessage.tool_call_id` 如何构成工具调用闭环。
- message schema 为什么是 Agent loop 的状态载体。
- 如果自己实现一个 Agent harness，最小消息模型应该有哪些字段。

