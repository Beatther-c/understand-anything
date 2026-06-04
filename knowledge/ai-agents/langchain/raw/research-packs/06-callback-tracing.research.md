# Research Pack: 06 Callback / Tracing

## 研究目标

解释 LangChain 如何用 callback handler、callback manager 和 run manager 记录 chain、model、tool 的运行生命周期。

## 核心实体

- `BaseCallbackHandler`
- `CallbackManager`
- `RunManager`
- `ParentRunManager`
- `CallbackManagerForChainRun`
- `RunnableConfig.callbacks`

## 源码入口

- `libs/core/langchain_core/callbacks/base.py:386`
- `libs/core/langchain_core/callbacks/base.py:409`
- `libs/core/langchain_core/callbacks/base.py:496`
- `libs/core/langchain_core/callbacks/manager.py:568`
- `libs/core/langchain_core/callbacks/manager.py:897`
- `libs/core/langchain_core/callbacks/manager.py:1343`
- `libs/core/langchain_core/callbacks/manager.py:1649`

## 候选 claims

- callback handler 定义运行生命周期事件。
- callback manager 负责向 handlers 分发事件。
- `get_child(tag)` 创建带 parent run id 的子 manager。
- tags 和 metadata 可以继承到子 run。

## 关键关系

- `RunnableConfig.callbacks -> CallbackManager.configure`
- `CallbackManager.on_chain_start -> CallbackManagerForChainRun`
- `RunManager.get_child -> child CallbackManager`

## 不确定问题

- 需要补充 RunnableSequence 对 child callback 的具体调用链。
- 需要补充 LangSmith tracer 的实际 handler 证据。

