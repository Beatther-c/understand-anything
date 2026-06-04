# Lab 04: Mini Chat Model Adapter

目标：实现一个 mock chat model adapter，验证 `invoke`、`stream`、`_generate`、`_stream`、`bind_tools` 的边界。

## 必做功能

- `BaseMiniChatModel.invoke(input, config=None)`
- `BaseMiniChatModel.stream(input, config=None)`
- `_generate(messages)` 抽象方法。
- `_stream(messages)` 可选方法。
- 输入支持 string、message list。
- 输出统一为 `AIMessage`。
- `bind_tools(tools)` 返回绑定 tools 的新模型或 wrapper。

## 验收用例

```python
model = EchoChatModel()
assert model.invoke("hi").type == "ai"
assert model.invoke([HumanMessage("hi")]).content == "hi"

stream_model = StreamingEchoChatModel()
assert [c.content for c in stream_model.stream("abc")] == ["a", "b", "c"]

fallback_model = EchoChatModel()
assert [m.content for m in fallback_model.stream("abc")] == ["abc"]
```

## 加分功能

- 支持 callback：`on_chat_model_start`、`on_llm_new_token`、`on_chat_model_end`。
- 支持 `usage_metadata`。
- `bind_tools` 后 mock model 可以返回 `AIMessage(tool_calls=[...])`。
- 支持 provider 原始响应保存在 `response_metadata`。

## 复盘问题

1. 为什么 `_generate` 是子类实现点，而不是上层调用点？
2. fallback stream 对调用者有什么风险？
3. tool binding 应该改变模型本身，还是返回 wrapper？

