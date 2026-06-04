# RunnableSequence

<!-- confidence: EXTRACTED -->

`RunnableSequence` 是顺序组合多个 [[runnable]] 的核心对象，源码位于 `libs/core/langchain_core/runnables/base.py:2995`。

## 关联

- 由 `Runnable.__or__` 创建。
- 用于表达 pipeline：前一步输出作为后一步输入。
- 相关主题：[[runnable-abstraction]]

## 证据

- `base.py:619`：`Runnable.__or__` 返回 `RunnableSequence(...)`。
- `base.py:3309`：`RunnableSequence.invoke` 遍历 `self.steps`。

