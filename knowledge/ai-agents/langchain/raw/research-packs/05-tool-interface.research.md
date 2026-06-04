# Research Pack: 05 Tool Interface

## 研究目标

解释 LangChain Tool 如何连接模型生成的调用意图、参数 schema、程序执行和结果回填。

## 核心实体

- `BaseTool`
- `StructuredTool`
- `ToolCall`
- `ToolMessage`
- `args_schema`
- `tool_call_schema`

## 源码入口

- `libs/core/langchain_core/tools/base.py:405`
- `libs/core/langchain_core/tools/base.py:455`
- `libs/core/langchain_core/tools/base.py:587`
- `libs/core/langchain_core/tools/base.py:635`
- `libs/core/langchain_core/tools/base.py:878`
- `libs/core/langchain_core/tools/structured.py:40`
- `libs/core/langchain_core/tools/structured.py:203`

## 候选 claims

- `BaseTool` 继承 `RunnableSerializable[str | dict | ToolCall, Any]`。
- `description` 是模型选择工具的重要输入。
- `args_schema` 支持 Pydantic model 或 JSON schema。
- `tool_call_schema` 会排除 injected args，只暴露模型应生成的字段。
- `invoke` 解析 Runnable 输入后调用 `run`。

## 关键关系

- `AIMessage.tool_calls -> ToolRegistry -> BaseTool.invoke`
- `BaseTool.run -> CallbackManager.on_tool_start`
- `Tool result -> ToolMessage`

## 不确定问题

- 需要补充 tool error / validation error 的测试证据。
- 需要追踪 provider adapter 如何消费 `tool_call_schema`。

