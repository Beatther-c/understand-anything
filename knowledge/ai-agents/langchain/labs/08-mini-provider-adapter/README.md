# Lab 08: Mini Provider Adapter

目标：实现一个 mock OpenAI provider adapter，验证 provider payload、stream chunk、tool schema conversion 和错误映射。

## 必做功能

- `MiniBaseChatModel`
- `MiniOpenAIChatModel`
- `_generate(messages)`
- `_stream(messages)`
- `_to_provider_payload(messages, tools=None)`
- `_from_provider_response(response)`
- `bind_tools(tools, tool_choice=None)`
- `convert_to_openai_tool(tool)`

## 验收用例

```python
model = MiniOpenAIChatModel(client=FakeOpenAIClient())
msg = model.invoke([HumanMessage("hi")])
assert msg.type == "ai"

bound = model.bind_tools([search_tool], tool_choice="any")
payload = bound._to_provider_payload([HumanMessage("find Runnable")])
assert payload["tool_choice"] == "required"
assert payload["tools"][0]["function"]["name"] == "search"
```

## 加分功能

- 支持 streaming chunk 转 `AIMessageChunk`。
- 支持 provider error 映射成统一异常。
- 支持 `response_metadata` 保存 provider headers。
- 支持 incompatible provider fields 测试。
- 支持 strict schema。

## 复盘问题

1. 哪些 provider 差异应该被 adapter 吸收？
2. 哪些 provider 特性应该作为扩展能力暴露给上层？
3. OpenAI-compatible provider 丢字段时，adapter 应该怎么提示使用者？

