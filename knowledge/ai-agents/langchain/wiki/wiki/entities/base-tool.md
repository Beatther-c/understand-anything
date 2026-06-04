# BaseTool

<!-- confidence: EXTRACTED -->

`BaseTool` 是 LangChain Core 的工具接口基类，源码位于 `libs/core/langchain_core/tools/base.py:405`。

## 关联

- 属于主题：[[tool-interface]]
- 被 [[agent-action]] 选择和执行
- 与 [[message-schema]] 通过 ToolMessage 形成闭环

## 证据

- `base.py:446`：定义 `name`。
- `base.py:449`：定义 `description`。
- `base.py:455`：定义 `args_schema`。
- `base.py:587`：定义 `tool_call_schema`。
- `base.py:635`：定义 `invoke`。
- `base.py:878`：定义 `run`。

