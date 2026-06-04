# Lab 05: Mini Tool Calling

目标：实现最小工具系统，验证模型调用意图、工具 schema、参数校验、执行和结果回填的完整闭环。

## 必做功能

- `MiniTool(name, description, args_schema, func)`
- `tool_call_schema`。
- `invoke(tool_call)`。
- 参数校验。
- `ToolRegistry`。
- `ToolMessage(content, tool_call_id)` 回填。

## 验收用例

```python
search = MiniTool(
    name="search_code",
    description="Search source code by keyword.",
    args_schema={"query": str},
    func=lambda query: f"found {query}",
)

call = {"id": "call_1", "name": "search_code", "args": {"query": "Runnable"}}
result = search.invoke(call)
message = ToolMessage(content=result, tool_call_id=call["id"])

assert "Runnable" in message.content
assert message.tool_call_id == "call_1"
```

## 加分功能

- 支持 unknown tool observation。
- 支持 validation error observation。
- 支持 `response_format="content_and_artifact"`。
- 支持 injected args，不暴露给模型。
- 支持 callback：`on_tool_start`、`on_tool_end`、`on_tool_error`。

## 复盘问题

1. Tool description 应该如何写，模型才更容易正确选择？
2. 参数校验失败时，应该让模型修正还是直接失败？
3. tool schema 和 provider tool schema 有什么区别？

