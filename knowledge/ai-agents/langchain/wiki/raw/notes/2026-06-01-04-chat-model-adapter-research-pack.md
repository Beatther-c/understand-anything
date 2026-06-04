# Research Pack: 04 ChatModel Adapter

## 研究目标

解释 `BaseChatModel` 如何作为 provider adapter 的统一边界，屏蔽不同模型 API 的输入、输出、streaming 和 tool binding 差异。

## 核心实体

- `BaseChatModel`
- `AIMessage`
- `ChatResult`
- `ChatGeneration`
- `_generate`
- `_stream`
- `bind_tools`

## 源码入口

- `libs/core/langchain_core/language_models/chat_models.py:270`
- `libs/core/langchain_core/language_models/chat_models.py:461`
- `libs/core/langchain_core/language_models/chat_models.py:713`
- `libs/core/langchain_core/language_models/chat_models.py:2181`
- `libs/core/langchain_core/language_models/chat_models.py:2227`
- `libs/core/langchain_core/language_models/chat_models.py:2325`

## 候选 claims

- `BaseChatModel` 统一 `invoke`、`stream`、`batch`、`bind_tools` 等方法。
- `invoke` 将输入转换为 prompt/messages，并返回标准 `AIMessage`。
- `stream` 在不支持 streaming 时 fallback 到 `invoke`。
- provider 子类必须实现 `_generate`。

## 关键关系

- `BaseChatModel.invoke -> generate_prompt -> AIMessage`
- `BaseChatModel.stream -> _stream | invoke fallback`
- `BaseChatModel.bind_tools -> provider-specific tool schema`

## 不确定问题

- 需要补充不同 provider 子类的对比。
- 需要追踪 token usage 标准化路径。

