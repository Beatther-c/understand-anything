# RunnableLambda

<!-- confidence: EXTRACTED -->

`RunnableLambda` 把 Python callable 包装为 [[runnable]]，源码位于 `libs/core/langchain_core/runnables/base.py:4577`。

## 关联

- 包装普通函数进入 Runnable 体系。
- 可以参与 [[runnable-sequence]]。
- 默认不适合真正 transform 级 streaming。

## 证据

- `base.py:4577`：定义 `RunnableLambda`。
- `base.py:5175`：同步 `invoke` 调用包装函数。
- `base.py:5314`：`stream` 进入 transform 路径。

