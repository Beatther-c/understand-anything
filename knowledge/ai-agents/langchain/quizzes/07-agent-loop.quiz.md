# 07 Agent Loop Quiz

## 概念题

1. Agent loop 和一次普通模型调用的差异是什么？
2. `AgentAction`、`AgentStep`、`AgentFinish` 分别表达什么？
3. `AgentActionMessageLog` 为什么对 chat model 有用？
4. ToolMessage 和 AgentStep 都和 observation 有关，它们有什么层级差异？
5. 为什么新版本 agent 更适合用 graph/workflow 表达？

## 源码题

1. 找到 `agents.py` 顶部 docstring，复述 basic agent 的 4 个步骤。
2. 找到 `AgentAction.tool`、`tool_input`、`log`，解释每个字段。
3. 找到 `AgentStep.messages`，说明 observation 如何转回 message。
4. 找到 `AgentFinish`，解释它和中间 step 的区别。
5. 找到 `create_agent` 的 docstring，说明它创建什么。
6. 找到 `graph.compile(...).with_config(config)`，解释为什么这不是简单 while loop。

## 设计题

1. 你会把 Agent loop 写成 while loop，还是状态机/graph？取决于什么？
2. 最大轮数、递归限制和停止条件分别解决什么风险？
3. 工具执行失败时，应该把错误作为 observation 回给模型，还是直接抛给用户？

## 故障诊断题

1. Agent 一直循环不结束，你会检查哪些停止条件？
2. 模型调用了不存在的工具，你会检查 tool registry 还是 model prompt？
3. 工具结果没有影响下一轮模型输出，你会检查 message history 中哪一步？

## 迁移题

1. 用伪代码实现一个最小 tool calling loop。
2. 把 Runnable、Message、Tool、ChatModel 组合成一个自己的 MiniAgent 设计。

