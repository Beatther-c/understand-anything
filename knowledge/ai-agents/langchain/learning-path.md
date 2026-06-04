# LangChain 学习路径

本路径面向有后端开发经验、但不默认熟悉 LLM / Agent 工程概念的学习者。每个单元都先补 AI 概念，再进入源码实现。

## 八个单元

1. Runnable：统一执行抽象、组合、`invoke` / `batch` / `stream`。
2. Message Schema：system / human / ai / tool message 如何表示对话状态。
3. Prompt Template：prompt 如何结构化、校验变量并进入 pipeline。
4. ChatModel Adapter：不同 provider 如何被统一成 ChatModel。
5. Tool Interface：tool calling 的 schema、执行和结果回填。
6. Callback / Tracing：运行生命周期、事件和可观测性。
7. Agent Loop：模型决策、工具执行、观察结果和停止条件。
8. Provider Integration：OpenAI 等 provider 的接入、兼容和测试约束。

## 当前建议节奏

第一轮先以 `01-runnable` 为主，因为它是后续 prompt、model、parser、tool、retriever 组合的底层心智模型。

完成标准：

- 能用自己的话解释 Runnable 解决的问题。
- 能在源码中定位 `Runnable`、`RunnableSequence`、`RunnableLambda`、`RunnableConfig`。
- 能追踪 `a | b` 如何变成 `RunnableSequence`。
- 能完成 `labs/01-mini-runnable` 的设计说明。

