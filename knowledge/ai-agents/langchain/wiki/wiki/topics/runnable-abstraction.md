# Runnable Abstraction

<!-- confidence: EXTRACTED -->

Runnable Abstraction 是 LangChain Core 用来统一 LLM 应用组件执行方式的模式。

## 核心节点

- [[runnable]]
- [[runnable-sequence]]
- [[runnable-lambda]]
- [[runnable-config]]

## 核心结论

<!-- confidence: EXTRACTED -->
[[runnable]] 统一 `invoke`、`batch`、`stream` 和组合。

<!-- confidence: EXTRACTED -->
`|` 操作符将 Runnable-like 对象组合为 [[runnable-sequence]]。

<!-- confidence: EXTRACTED -->
[[runnable-lambda]] 让普通 Python 函数进入 Runnable 体系。

## 学习材料

- `knowledge/ai-agents/langchain/lessons/01-runnable.md`
- `knowledge/ai-agents/langchain/mastery/01-runnable.mastery.md`
- `knowledge/ai-agents/langchain/labs/01-mini-runnable/README.md`

