# 02 Message Schema Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释为什么 messages 是 Agent 状态的基础。

完成标准：

- 说到 role / type。
- 说到 tool call 和 tool result。
- 说到 message history 会回到下一轮模型输入。

## Level 2: 源码定位

定位并记录文件和行号：

- `BaseMessage`
- `BaseMessage.content`
- `BaseMessage.additional_kwargs`
- `AIMessage.tool_calls`
- `AIMessage.usage_metadata`
- `ToolMessage.tool_call_id`
- `ToolMessage.artifact`

## Level 3: 状态流重建

手写一次消息流：

```text
HumanMessage -> AIMessage(tool_calls=[...]) -> ToolMessage -> AIMessage(final)
```

要求标出每条消息的 `type`、关键字段和它在 Agent loop 中的作用。

## Level 4: 图谱重建

不看 `graph/relations.json`，画出以下实体关系：

- `BaseMessage`
- `AIMessage`
- `ToolMessage`
- `BaseTool`
- `Agent Loop`
- `tool_call_id`

## Level 5: 故障诊断

给出排查步骤：

- 工具结果没有被模型理解。
- 多工具并行调用时结果对不上。
- provider 返回的原始 tool call 无法被标准化。

## Level 6: 微改造

在 `labs/02-message-types` 中增加：

- `usage_metadata`
- `response_metadata`
- `artifact`
- `from_dict()` 反序列化

说明哪些字段应该发给模型，哪些字段只给程序使用。

