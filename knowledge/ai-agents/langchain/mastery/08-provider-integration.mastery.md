# 08 Provider Integration Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释 Provider Integration 如何把具体模型 API 差异藏在 adapter 内。

完成标准：

- 说到 `BaseChatModel`。
- 说到 `_generate` / `_stream`。
- 说到 tool schema 转换。

## Level 2: 源码定位

定位并记录文件和行号：

- `BaseChatOpenAI`
- `model_name`
- `openai_api_key`
- `_stream`
- `_generate`
- `bind_tools`
- `convert_to_openai_tool`
- `tool_choice == "any"`
- `ChatOpenAI`

## Level 3: Payload 追踪

追踪一次：

```text
LangChain messages -> OpenAI payload -> OpenAI response -> ChatResult / AIMessage
```

要求说明哪些步骤发生在 adapter 内。

## Level 4: Tool Binding 追踪

追踪：

```text
BaseTool -> convert_to_openai_tool -> formatted_tools -> bind(...)
```

说明 `strict`、`parallel_tool_calls`、`tool_choice` 分别影响什么。

## Level 5: 故障诊断

给出排查步骤：

- OpenAI-compatible provider 丢字段。
- `tool_choice="any"` 行为不符合预期。
- stream chunk 没有触发 token callback。

## Level 6: 微改造

在 `labs/08-mini-provider-adapter` 中增加：

- mock OpenAI payload conversion
- mock streaming chunk conversion
- tool schema conversion
- provider-specific error mapping
- tests for incompatible provider fields

说明哪些 provider 差异应该向上暴露，哪些应该被 adapter 吸收。

