# 05 Tool Interface Quiz

## 概念题

1. 为什么说模型不会直接执行工具，只会生成工具调用意图？
2. `name`、`description`、`args_schema` 对模型和框架分别有什么作用？
3. `tool_call_schema` 和 `args_schema` 有什么关系？
4. Tool 为什么也继承 Runnable？
5. `response_format="content_and_artifact"` 解决什么问题？

## 源码题

1. 找到 `BaseTool` 继承关系，说明它的输入类型为什么包含 `ToolCall`。
2. 找到 `description` 的注释，解释它为什么会影响模型选择工具。
3. 找到 `args_schema` 支持的类型。
4. 找到 `tool_call_schema` 排除 injected args 的逻辑。
5. 找到 `invoke` 和 `run`，写出从 Runnable 输入到真实工具执行的调用链。
6. 找到 `StructuredTool.from_function` 的 schema 推断逻辑。

## 设计题

1. Tool description 应该写得像 API 文档，还是像模型决策说明？为什么？
2. 参数校验失败时，应该让 Agent 停止、让模型重试，还是返回错误观察？
3. 哪些参数不应该暴露给模型，而应该作为 injected args？

## 故障诊断题

1. 模型总是选错工具，你会先看 name、description 还是 args_schema？
2. 模型参数格式不对，你会检查 provider tool schema 还是 BaseTool args schema？
3. 工具执行成功但模型不知道结果，你会检查 ToolMessage 哪些字段？

## 迁移题

1. 用 Java 设计 `Tool<TInput, TOutput>`、schema 和 handler 的关系。
2. 设计一个 `search_code` 工具，写出 name、description、args_schema 和返回格式。

