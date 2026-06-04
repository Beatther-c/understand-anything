# Lab 06: Mini Callback Tracer

目标：实现一个最小 callback/tracing 系统，验证 run id、parent run id、tags、metadata 和事件分发。

## 必做功能

- `CallbackHandler`
- `CallbackManager`
- `RunManager`
- `get_child(tag)`
- `on_chain_start` / `on_chain_end`
- `on_chat_model_start` / `on_llm_new_token` / `on_chat_model_end`
- `on_tool_start` / `on_tool_end` / `on_tool_error`
- 输出 run tree。

## 验收用例

```python
handler = RecordingHandler()
manager = CallbackManager([handler], tags=["lesson:06"])
chain_run = manager.on_chain_start({"name": "agent"}, {"input": "hi"})
tool_manager = chain_run.get_child("tool:search")
tool_run = tool_manager.on_tool_start({"name": "search"}, "Runnable")
tool_run.on_tool_end("found")
chain_run.on_chain_end({"output": "done"})

assert handler.tree().root.name == "agent"
assert handler.tree().root.children[0].tags == ["tool:search"]
```

## 加分功能

- 支持 metadata 继承。
- 支持 ignore flags。
- 支持异常事件。
- 支持导出 markdown trace report。
- 支持 token stream event。

## 复盘问题

1. run id 和 parent run id 与普通日志行有什么不同？
2. tags 应该继承还是只在本地生效？
3. tracing 里哪些内容可能有隐私风险？

