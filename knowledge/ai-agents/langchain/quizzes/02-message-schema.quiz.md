# 02 Message Schema Quiz

## 概念题

1. 为什么聊天模型输入要用 message list，而不是只传普通字符串？
2. `SystemMessage`、`HumanMessage`、`AIMessage`、`ToolMessage` 分别表达什么语义？
3. `AIMessage.tool_calls` 和 `ToolMessage.tool_call_id` 为什么需要配合？
4. `additional_kwargs` 和标准化字段有什么区别？为什么 LangChain 两者都保留？
5. 为什么 tool result 必须回填到 message history，而不是只在程序内存里保存？

## 源码题

1. 找到 `BaseMessage.content`、`additional_kwargs`、`response_metadata`、`type`，分别说明它们解决什么问题。
2. 找到 `AIMessage.tool_calls`、`invalid_tool_calls`、`usage_metadata`，解释这三个字段分别适合记录什么。
3. 找到 `ToolMessage.tool_call_id`，说明它如何支持模型并行请求多个工具。
4. 对比 `HumanMessage.type`、`SystemMessage.type`、`AIMessage.type`、`ToolMessage.type`，解释 `type` 对反序列化的价值。

## 设计题

1. 如果你设计自己的 Agent message schema，`role` 用 enum 还是用子类？为什么？
2. `ToolMessage.artifact` 不直接发给模型，而是留给程序使用。这个设计解决了什么问题？
3. 如果 provider 返回一个 LangChain 标准字段里没有的信息，你会放在标准字段、metadata，还是 additional kwargs？

## 故障诊断题

1. 模型请求了两个工具，但第二个工具结果被模型误认为第一个工具结果。你会先检查哪些字段？
2. Agent 下一轮看不到工具结果，你会检查 message history 中是否缺了什么？
3. token usage 在不同 provider 下字段不一致，为什么 `usage_metadata` 有价值？

## 迁移题

1. 用 Java 设计一个最小 message hierarchy，至少包含哪些字段和类型？
2. 在你自己的 Agent harness 中，如何保存一轮 `Human -> AI(tool call) -> Tool -> AI(final)`？

