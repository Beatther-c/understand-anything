# Research Pack: 08 Provider Integration

## 研究目标

解释 OpenAI provider adapter 如何继承 `BaseChatModel`，并处理 OpenAI API payload、streaming、tool schema 和兼容差异。

## 核心实体

- `BaseChatOpenAI`
- `ChatOpenAI`
- `_generate`
- `_stream`
- `bind_tools`
- `convert_to_openai_tool`

## 源码入口

- `libs/partners/openai/langchain_openai/chat_models/base.py:581`
- `libs/partners/openai/langchain_openai/chat_models/base.py:599`
- `libs/partners/openai/langchain_openai/chat_models/base.py:608`
- `libs/partners/openai/langchain_openai/chat_models/base.py:1549`
- `libs/partners/openai/langchain_openai/chat_models/base.py:1624`
- `libs/partners/openai/langchain_openai/chat_models/base.py:2131`
- `libs/partners/openai/langchain_openai/chat_models/base.py:2171`
- `libs/partners/openai/langchain_openai/chat_models/base.py:2200`
- `libs/partners/openai/langchain_openai/chat_models/base.py:2534`

## 候选 claims

- `BaseChatOpenAI` 继承 `BaseChatModel`。
- API key 可从 `OPENAI_API_KEY` 推断。
- `_stream` 设置 stream payload 并把 provider chunk 转成 LangChain chunk。
- `_generate` 处理 chat completions、responses API 和 response_format 分支。
- `bind_tools` 使用 `convert_to_openai_tool` 转换工具 schema。
- `tool_choice="any"` 被转换为 OpenAI 支持的 `"required"`。

## 关键关系

- `ChatOpenAI -> BaseChatOpenAI -> BaseChatModel`
- `BaseTool -> convert_to_openai_tool -> OpenAI tools payload`
- `OpenAI response -> ChatResult -> AIMessage`

## 不确定问题

- 需要补充 OpenAI integration 测试证据。
- 需要对比 Anthropic 或其他 provider adapter，抽取跨 provider pattern。

