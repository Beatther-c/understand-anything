# Agent Loop Compiled Graph Trace

## 目标

追踪一次 `create_agent` 生成的 compiled graph 如何完成：

```text
HumanMessage -> model node -> AIMessage.tool_calls -> tools node -> ToolMessage -> model node -> finish
```

## 证据入口

- `libs/langchain_v1/tests/unit_tests/agents/test_injected_runtime_create_agent.py:36-81`
- `libs/langchain_v1/tests/unit_tests/agents/middleware/core/test_tools.py:101-123`
- `libs/langchain_v1/langchain/agents/factory.py:696-1683`
- `libs/core/langchain_core/messages/ai.py`
- `libs/core/langchain_core/messages/tool.py`

## 真实测试用例路径

`test_tool_runtime_basic_injection` 构造了一个最小 agent：

```python
agent = create_agent(
    model=FakeToolCallingModel(
        tool_calls=[
            [{"args": {"x": 42}, "id": "call_123", "name": "runtime_tool"}],
            [],
        ]
    ),
    tools=[runtime_tool],
    system_prompt="You are a helpful assistant.",
)

result = agent.invoke({"messages": [HumanMessage("Test")]})
```

执行过程：

1. `create_agent` 接收 model、tools、system_prompt，构造并编译 graph。
2. `agent.invoke` 接收 state：`{"messages": [HumanMessage("Test")]}`。
3. model node 调用 `FakeToolCallingModel`，第一次输出 `AIMessage`，其中包含 `tool_calls=[{"name": "runtime_tool", "args": {"x": 42}, "id": "call_123"}]`。
4. graph 根据 `AIMessage.tool_calls` 进入 tools node。
5. tools node 调用 `runtime_tool(x=42, runtime=ToolRuntime(...))`。
6. tool 执行返回 `"Processed 42"`。
7. graph 生成 `ToolMessage(content="Processed 42", tool_call_id="call_123")`，并把它追加回 message state。
8. message state 回到 model node。`FakeToolCallingModel` 第二次没有 tool call。
9. graph 停止循环，返回 `result["messages"]`。

测试断言：

- `len(result["messages"]) == 4`
- 第 3 条消息是 `ToolMessage`
- `tool_message.content == "Processed 42"`
- `tool_message.tool_call_id == "call_123"`
- `runtime.state` 存在，并且包含 `messages`
- `runtime.tool_call_id == "call_123"`
- `runtime.config` 存在

## 补充：middleware 改写 tools node

`test_tools.py:101-123` 进一步证明 `create_agent` 的 tools node 可以被 middleware 调整：

1. model 计划调用 `tool_a`。
2. middleware 将可见工具过滤为 `tool_a` 和 `tool_b`。
3. agent graph 执行后产生一个 `ToolMessage`。
4. 断言该 `ToolMessage.name == "tool_a"`。

这说明 v1 Agent Loop 不是固定 while loop，而是 graph 中的 model node、tools node、middleware 和 state reducer 协作。

## 本地执行说明

我尝试用当前 shell 直接执行同构脚本，以获得 runtime 输出。`langchain` 包本身可以从本地 `libs/langchain_v1` 导入，但完整 `create_agent` 脚本在当前系统 `python3` 下触发了类型语法兼容问题：

```text
TypeError: unsupported operand type(s) for |: 'type' and 'NoneType'
```

触发点是 `langchain_core/_import_utils.py` 中使用了 `str | None` 这类 Python 3.10+ 类型语法，而当前命令行 `python3` 对该语法不兼容。因此本 trace 的强证据采用仓库内已存在的 unit test，而不是伪造本地 runtime transcript。

这不会削弱源码学习结论：上述两个测试已经是 LangChain 项目自己的 compiled graph 行为验证，且覆盖了 tool call、ToolMessage 回填、runtime 注入和 middleware tools node。
