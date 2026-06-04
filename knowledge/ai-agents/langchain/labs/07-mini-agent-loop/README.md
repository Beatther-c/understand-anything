# Lab 07: Mini Agent Loop

目标：把 Message、ChatModel、Tool、Callback 串起来，实现一个最小 tool calling agent loop。

## 必做功能

- `MiniAgent(model, tools, max_steps=5, callbacks=None)`
- message history。
- 调用 model。
- 如果 `AIMessage.tool_calls` 为空，返回最终回答。
- 如果有 tool calls，执行工具并追加 `ToolMessage`。
- 支持 unknown tool。
- 支持 max steps 停止。

## 验收用例

```python
model = ScriptedModel([
    AIMessage("", tool_calls=[{"id": "call_1", "name": "search", "args": {"query": "Runnable"}}]),
    AIMessage("Runnable is a unified execution abstraction."),
])
agent = MiniAgent(model=model, tools=[search_tool], max_steps=3)

answer = agent.invoke("What is Runnable?")
assert "unified execution" in answer
assert agent.messages[-2].type == "tool"
```

## 加分功能

- 支持 validation error observation。
- 支持 callback tracing。
- 支持 `AgentStep(action, observation)` 记录。
- 支持 graph 风格 model node / tool node，而不是纯 while loop。
- 支持 human interrupt hook。

## 复盘问题

1. 你的停止条件有哪些？
2. ToolMessage 和 AgentStep 在你的实现中是否都需要？
3. 如果模型连续返回同一个 tool call，如何避免无限循环？

