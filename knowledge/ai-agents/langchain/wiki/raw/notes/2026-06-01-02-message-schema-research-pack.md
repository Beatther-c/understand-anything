# Research Pack: 02 Message Schema

## 研究目标

解释 LangChain 如何用 message schema 表达 chat model 输入输出、tool call 意图、tool result 回填和 Agent 状态日志。

## 核心实体

- `BaseMessage`
- `HumanMessage`
- `SystemMessage`
- `AIMessage`
- `ToolMessage`

## 源码入口

- `libs/core/langchain_core/messages/base.py:93`
- `libs/core/langchain_core/messages/human.py:9`
- `libs/core/langchain_core/messages/system.py:9`
- `libs/core/langchain_core/messages/ai.py:160`
- `libs/core/langchain_core/messages/tool.py:26`

## 候选 claims

- `BaseMessage` 是 chat model 输入输出的抽象基类。
- `AIMessage` 不只是文本，还包含 `tool_calls`、`invalid_tool_calls` 和 `usage_metadata`。
- `ToolMessage.tool_call_id` 用于把工具结果与模型发起的 tool call 对齐。
- message history 是 Agent loop 的状态载体。

## 关键关系

- `AIMessage.tool_calls -> BaseTool.invoke`
- `BaseTool.run -> ToolMessage`
- `ToolMessage.tool_call_id -> AIMessage.tool_calls[].id`

## 不确定问题

- 需要补充 message serialization 相关测试。
- 需要追踪 provider 原始 tool call 如何进入 `AIMessage.tool_calls`。

