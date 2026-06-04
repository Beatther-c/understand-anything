# BaseMessage

<!-- confidence: EXTRACTED -->

`BaseMessage` 是 LangChain Core 的消息基类，源码位于 `libs/core/langchain_core/messages/base.py:93`。

## 关联

- 属于主题：[[message-schema]]
- 被 [[agent-loop]] 用来承载对话状态
- 与 [[tool-interface]] 通过 ToolMessage / tool call 关联

## 证据

- `base.py:93`：定义 `BaseMessage`。
- `base.py:103`：定义 `content`。
- `base.py:106`：定义 `additional_kwargs`。
- `base.py:117`：定义 `type`。

