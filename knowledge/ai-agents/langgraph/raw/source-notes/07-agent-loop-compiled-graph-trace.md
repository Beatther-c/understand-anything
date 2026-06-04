# ReAct Agent 执行路径源码追踪

基于 `create_react_agent` 和 `ToolNode` 的源码/测试证据整理，未伪造本地真实 LLM transcript。

```text
input state: {"messages": [HumanMessage(...)]}
  -> model node: call_model reads messages/context/store
  -> AIMessage with tool_calls
  -> conditional edge: tools_condition routes to ToolNode
  -> ToolNode executes selected tool, injects state/store/runtime when annotated
  -> ToolMessage appended through messages reducer
  -> edge routes back to model node
  -> model returns final AIMessage without tool_calls
  -> conditional edge routes to END
```

中断路径：

```text
node calls interrupt(value)
  -> GraphInterrupt surfaces __interrupt__
  -> caller sends Command(resume=...)
  -> graph resumes from checkpoint/thread config
```

主要证据：`ev-react-loop-code`, `ev-toolnode-code`, `ev-interrupt-code`, `ev-test-interrupt-loop`, `ev-test-parent-command`。
