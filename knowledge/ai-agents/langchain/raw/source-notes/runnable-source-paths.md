# Runnable 源码路径记录

源码仓库：`repos/langchain`

Commit：

```text
bc5f1517cf7ac27addd4286e388228b8172b93b9
```

## 关键文件

- `libs/core/langchain_core/runnables/base.py`
- `libs/core/langchain_core/runnables/config.py`
- `libs/core/tests/unit_tests/runnables/test_concurrency.py`
- `libs/core/tests/unit_tests/runnables/test_runnable_events_v2.py`

## 关键符号

- `Runnable`：`base.py:125`
- `Runnable.__or__`：`base.py:619`
- `Runnable.pipe`：`base.py:661`
- `Runnable.invoke`：`base.py:823`
- `Runnable.batch`：`base.py:868`
- `Runnable.stream`：`base.py:1131`
- `RunnableSequence`：`base.py:2995`
- `RunnableSequence.invoke`：`base.py:3309`
- `RunnableSequence.batch`：`base.py:3385`
- `RunnableSequence.stream`：`base.py:3706`
- `RunnableLambda`：`base.py:4577`
- `RunnableLambda.invoke`：`base.py:5175`
- `RunnableLambda.stream`：`base.py:5314`
- `RunnableConfig`：`config.py:49`

## 测试证据

- `test_concurrency.py:13`：异步 batch 并发限制测试。
- `test_concurrency.py:79`：同步 batch 并发限制测试。
- `test_runnable_events_v2.py:1496`：`RunnableLambda(foo) | RunnableLambda(bar)` 形成 `RunnableSequence` 的事件链测试。

