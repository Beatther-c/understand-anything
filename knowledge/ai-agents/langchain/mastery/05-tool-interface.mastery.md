# 05 Tool Interface Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释 tool calling 为什么不是模型直接执行函数。

完成标准：

- 说到模型生成调用意图。
- 说到 schema 校验。
- 说到工具结果回填。

## Level 2: 源码定位

定位并记录文件和行号：

- `BaseTool`
- `name`
- `description`
- `args_schema`
- `response_format`
- `tool_call_schema`
- `invoke`
- `run`
- `StructuredTool.from_function`

## Level 3: 闭环重建

手写：

```text
AIMessage.tool_calls -> BaseTool.invoke -> BaseTool.run -> ToolMessage
```

要求说明每一步的输入输出。

## Level 4: Schema 判断

给一个工具函数，写出：

- 模型看到的 tool schema。
- 程序执行时需要的真实参数。
- 哪些字段不该让模型生成。

## Level 5: 故障诊断

给出排查步骤：

- 模型选错工具。
- 模型传错参数。
- 工具执行成功但模型没用上结果。

## Level 6: 微改造

在 `labs/05-mini-tool-calling` 中增加：

- Pydantic-like 参数校验
- tool registry
- unknown tool error
- validation error observation
- artifact 字段

说明哪些错误应该返回给模型，哪些应该终止执行。

