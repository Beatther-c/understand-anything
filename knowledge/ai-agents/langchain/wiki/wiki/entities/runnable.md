# Runnable

<!-- confidence: EXTRACTED -->

`Runnable` 是 LangChain Core 的统一执行抽象，源码位于 `libs/core/langchain_core/runnables/base.py:125`。

## 关联

- 属于主题：[[runnable-abstraction]]
- 组合为：[[runnable-sequence]]
- 可由普通函数包装为：[[runnable-lambda]]
- 执行时使用：[[runnable-config]]

## 证据

- `base.py:125`：定义 `Runnable`。
- `base.py:823`：定义 `invoke` 契约。
- `base.py:868`：定义默认 `batch`。
- `base.py:1131`：定义默认 `stream`。

