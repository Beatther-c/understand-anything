# 04 ChatModel Adapter Quiz

## 概念题

1. 为什么 Agent 不应该直接依赖某个 provider SDK？
2. `BaseChatModel` 的 imperative methods 和 declarative methods 有什么区别？
3. `invoke`、`stream`、`batch` 在 ChatModel 层分别表达什么？
4. 为什么 `stream` 可能 fallback 到 `invoke`？
5. `bind_tools` 为什么属于 ChatModel adapter，而不只是 Tool 层？

## 源码题

1. 找到 `BaseChatModel` 文档表，列出 4 个 imperative methods。
2. 找到 `BaseChatModel.invoke`，写出从 input 到 `AIMessage` 的关键调用链。
3. 找到 `BaseChatModel.stream` 的 fallback 分支，解释这个分支的意义。
4. 找到 `_generate` 抽象方法，说明 provider 子类必须实现什么。
5. 找到 `bind_tools` 的 base 签名，解释它的输入和输出。

## 设计题

1. 如果你设计 ChatModel adapter，会把 streaming 放在同一个接口还是拆成 StreamableChatModel？
2. provider 原始响应是否应该暴露给上层 Agent？为什么？
3. 你会如何设计 model adapter 的错误和重试边界？

## 故障诊断题

1. 上层调用 `stream` 但没有逐 chunk 输出，可能原因是什么？
2. 工具绑定后模型仍不调用工具，你会从 ChatModel adapter 哪些位置排查？
3. 某 provider 返回 token usage 字段不同，你会在哪里做归一化？

## 迁移题

1. 用 Java 设计一个 `ChatModel` 接口和一个 `OpenAIChatModelAdapter`。
2. 设计一个 mock chat model，用于测试 Agent loop，而不调用真实模型。

