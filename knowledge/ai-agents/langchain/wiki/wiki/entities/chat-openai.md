# ChatOpenAI

<!-- confidence: EXTRACTED -->

`ChatOpenAI` 是 OpenAI partner 包中的 chat model adapter，源码位于 `libs/partners/openai/langchain_openai/chat_models/base.py:2534`。

## 关联

- 属于主题：[[provider-integration]]
- 实现/扩展 [[base-chat-model]]
- 支持 [[tool-interface]] 的 OpenAI tool schema 转换

## 证据

- `base.py:581`：定义 `BaseChatOpenAI`。
- `base.py:1549`：定义 `_stream`。
- `base.py:1624`：定义 `_generate`。
- `base.py:2131`：定义 `bind_tools`。
- `base.py:2534`：定义 `ChatOpenAI`。

