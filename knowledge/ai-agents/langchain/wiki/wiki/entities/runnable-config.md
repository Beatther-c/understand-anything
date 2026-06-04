# RunnableConfig

<!-- confidence: EXTRACTED -->

`RunnableConfig` 是 [[runnable]] 执行时的配置对象，源码位于 `libs/core/langchain_core/runnables/config.py:49`。

## 关联

- 为 [[runnable]] 提供 callbacks、tags、metadata、run_name、max_concurrency 等运行信息。
- 与 tracing、batch 并发控制相关。

## 证据

- `config.py:49`：定义 `RunnableConfig`。
- `config.py:95`：定义 `max_concurrency`。

