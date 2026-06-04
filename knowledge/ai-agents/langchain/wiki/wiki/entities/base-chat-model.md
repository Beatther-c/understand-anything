# BaseChatModel

<!-- confidence: EXTRACTED -->

`BaseChatModel` 是 LangChain Core 的 chat model 统一抽象，源码位于 `libs/core/langchain_core/language_models/chat_models.py:270`。

## 关联

- 属于主题：[[chat-model-adapter]]
- 被 [[chat-openai]] 实现/扩展
- 使用 [[message-schema]] 作为输入输出模型

## 证据

- `chat_models.py:270`：定义 `BaseChatModel`。
- `chat_models.py:461`：定义 `invoke`。
- `chat_models.py:713`：定义 `stream`。
- `chat_models.py:2325`：定义 `bind_tools`。

