# 99 Capstone Mastery

## Level 1: 总体复述

用 500-800 字解释 LangChain 如何把 LLM 应用组件标准化、组合化，并支撑 Agent 框架。

必须覆盖：

- Runnable
- Message Schema
- Prompt Template
- ChatModel Adapter
- Tool Interface
- Callback / Tracing
- Agent Loop
- Provider Integration

## Level 2: 全链路图

画出一条完整链路：

```text
PromptTemplate
  -> ChatModel.bind_tools
  -> AIMessage.tool_calls
  -> Tool.invoke/run
  -> ToolMessage
  -> Agent loop next turn
  -> final AIMessage
```

每个节点标注对应源码入口。

## Level 3: 源码索引

为 8 个单元各列出 3 个最关键源码符号和行号。

## Level 4: Mini LangChain Agent

完成 `labs/99-capstone-mini-langchain-agent`：

- runnable
- messages
- prompt template
- chat model adapter
- tools
- callback tracer
- agent loop
- mock provider

## Level 5: 故障演练

设计并解释 5 个故障：

- prompt 缺变量
- provider streaming fallback
- tool 参数错误
- tool result 未回填
- agent 无限循环

每个故障都要说明如何通过 tracing 和源码知识定位。

## Level 6: 迁移设计

如果你要用 Java 实现一个最小 Agent framework，写出模块划分、接口草图、测试策略和你会暂时舍弃的复杂能力。

