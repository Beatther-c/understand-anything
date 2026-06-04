# 07 Agent Loop Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释 Agent loop 的“决策、行动、观察、继续或结束”。

完成标准：

- 说到模型生成动作。
- 说到工具执行。
- 说到观察回填。
- 说到停止条件。

## Level 2: 源码定位

定位并记录文件和行号：

- agent flow docstring
- `AgentAction`
- `AgentActionMessageLog`
- `AgentStep`
- `AgentFinish`
- `_convert_agent_action_to_messages`
- `_convert_agent_observation_to_messages`
- `create_agent`
- `graph.compile`

## Level 3: Loop 重建

手写一个最小 loop：

```text
messages -> model -> tool_calls? -> tools -> tool messages -> model -> final
```

要求说明每个数据结构来自前面哪一课。

## Level 4: 状态机设计

画出两个状态：

- model node
- tool node

以及两条边：

- 有 tool call
- 无 tool call / final

## Level 5: 故障诊断

给出排查步骤：

- Agent 无限循环。
- 调用了不存在的工具。
- 工具结果没有进入下一轮 prompt。
- 模型返回无法解析的 tool call。

## Level 6: 微改造

在 `labs/07-mini-agent-loop` 中增加：

- max steps
- unknown tool handling
- validation error observation
- callback tracing
- final answer detection

说明你实现的是 while loop 还是 graph。

