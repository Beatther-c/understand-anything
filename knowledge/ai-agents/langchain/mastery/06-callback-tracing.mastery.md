# 06 Callback / Tracing Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释为什么 Agent 需要 tracing，而不是只需要日志。

完成标准：

- 说到 run lifecycle。
- 说到父子层级。
- 说到模型和工具事件。

## Level 2: 源码定位

定位并记录文件和行号：

- `BaseCallbackHandler`
- `on_chain_start`
- `on_tool_start`
- `CallbackManager`
- `on_chat_model_start`
- `on_chain_start`
- `get_child`
- `configure`

## Level 3: Run 树重建

画出一次：

```text
chain
  prompt
  model
  tool
  model
```

要求为每个节点标注 run id、parent run id、tags、metadata。

## Level 4: 事件流追踪

手写一次 tool run 的事件序列：

```text
on_tool_start -> run tool -> on_tool_end / on_tool_error
```

并说明 inputs、tool_call_id、metadata 应该在哪里出现。

## Level 5: 故障诊断

给出排查步骤：

- trace 没有子步骤。
- trace 里没有 tool run。
- metadata 没有传到子 run。

## Level 6: 微改造

在 `labs/06-mini-callback-tracer` 中增加：

- parent-child run tree
- tags
- metadata
- error event
- token stream event

输出一份可读 trace report。

