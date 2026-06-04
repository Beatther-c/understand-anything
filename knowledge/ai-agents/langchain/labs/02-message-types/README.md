# Lab 02: Message Types

目标：实现一个最小 message schema，验证你理解 `BaseMessage`、`AIMessage.tool_calls` 和 `ToolMessage.tool_call_id` 的作用。

## 必做功能

- `BaseMessage(type, content, additional_kwargs=None, response_metadata=None, name=None, id=None)`
- `SystemMessage(content)`
- `HumanMessage(content)`
- `AIMessage(content, tool_calls=None, invalid_tool_calls=None, usage_metadata=None)`
- `ToolMessage(content, tool_call_id, artifact=None)`
- `to_dict()` / `from_dict()`
- `message.type` 必须可用于反序列化。

## 验收用例

```python
messages = [
    SystemMessage("You are a code assistant."),
    HumanMessage("Find RunnableSequence."),
    AIMessage("", tool_calls=[{"id": "call_1", "name": "search_code", "args": {"q": "RunnableSequence"}}]),
    ToolMessage("base.py:2995 class RunnableSequence", tool_call_id="call_1"),
]

assert messages[2].tool_calls[0]["id"] == messages[3].tool_call_id
assert messages[0].to_dict()["type"] == "system"
assert BaseMessage.from_dict(messages[3].to_dict()).tool_call_id == "call_1"
```

## 加分功能

- 校验 `ToolMessage.tool_call_id` 不能为空。
- 支持 `artifact`，但默认不放入发送给模型的 content。
- 支持 `usage_metadata={"input_tokens": 10, "output_tokens": 5}`。
- 实现 `filter_model_visible_fields()`。

## 复盘问题

1. 哪些字段应该进入模型上下文，哪些只给程序使用？
2. 如果一个 `AIMessage` 有多个 tool calls，如何保证结果不串？
3. `additional_kwargs` 和标准化字段同时存在时，读取优先级怎么定？

