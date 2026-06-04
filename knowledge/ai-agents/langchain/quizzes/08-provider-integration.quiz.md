# 08 Provider Integration Quiz

## 概念题

1. Provider Integration 和 ChatModel Adapter 的关系是什么？
2. 为什么 `ChatOpenAI` 不是 Agent？
3. OpenAI-compatible API 为什么不一定能完全用 `ChatOpenAI`？
4. `tool_choice="any"` 转成 `"required"` 体现了 adapter 的什么职责？
5. provider adapter 为什么会比普通 SDK wrapper 厚？

## 源码题

1. 找到 `BaseChatOpenAI(BaseChatModel)`，说明这个继承关系的意义。
2. 找到 `openai_api_key` 字段，说明它如何从环境变量推断。
3. 找到 `_stream`，说明它如何设置 stream payload 并处理 chunk。
4. 找到 `_generate`，说明 response_format 和 responses API 分支。
5. 找到 `bind_tools`，说明 `convert_to_openai_tool` 的作用。
6. 找到 `tool_choice == "any"` 的兼容逻辑。

## 设计题

1. provider 原始字段应不应该全部保留？如果保留，放在哪里？
2. OpenAI responses API 和 chat completions API 的差异应该暴露给上层吗？
3. 如果某 provider 支持 LangChain 没抽象出的能力，你会如何扩展？

## 故障诊断题

1. OpenAI adapter streaming 没有 token usage，你会检查哪些参数？
2. Tool schema 转换后 provider 报 schema 不支持，你会检查 Tool schema 还是 adapter conversion？
3. 使用第三方 OpenAI-compatible base_url 时丢了非标准字段，原因可能是什么？

## 迁移题

1. 实现一个 mock provider adapter，要求兼容 `BaseChatModel.invoke` 的心智模型。
2. 设计一个 provider adapter 测试矩阵，覆盖 generate、stream、tool binding、error handling。

