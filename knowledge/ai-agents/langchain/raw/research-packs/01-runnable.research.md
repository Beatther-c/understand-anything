# Research Pack: 01 Runnable

## 学习目标

理解 LangChain 为什么需要 `Runnable` 作为统一执行抽象，以及 `RunnableSequence`、`RunnableLambda`、`RunnableConfig` 如何共同支撑组合、批处理、流式输出和 tracing。

## 输入素材

- Understand Anything scan：`raw/code-graph/libs-core.scan-result.json`
- Understand Anything batches：`raw/code-graph/libs-core.batches.json`
- 源码路径记录：`raw/source-notes/runnable-source-paths.md`

## 初步实体

- `Runnable`
- `RunnableSequence`
- `RunnableLambda`
- `RunnableConfig`
- `invoke`
- `batch`
- `stream`
- `__or__`
- `pipe`

## 初步关系

- `RunnableSequence` 继承/实现 `Runnable` 的执行接口。
- `Runnable.__or__` 创建 `RunnableSequence`。
- `Runnable.pipe` 是 `|` 组合的显式方法形式。
- `Runnable.batch` 默认通过 executor 并发调用 `invoke`。
- `Runnable.stream` 默认只包装一次 `invoke`，真正流式能力需要子类覆盖。
- `RunnableLambda` 把普通 Python callable 包成 Runnable。
- `RunnableConfig` 把 callbacks、tags、metadata、max_concurrency 等运行配置传入执行过程。

## 候选 Claims

1. LangChain 用 `Runnable` 统一 prompt、model、parser、tool 等组件的执行形态。
2. `|` 操作符不是语法糖级别的拼接，而是构造 `RunnableSequence`。
3. `batch` 的默认实现适合 IO bound Runnable，因为它并发调用 `invoke`。
4. `stream` 默认不等于真正流式，默认实现只是 yield `invoke` 的结果。
5. `RunnableLambda` 适合包装普通函数，但默认不适合需要 transform 级别流式处理的逻辑。

## 不确定问题

- `RunnableSequence` 的完整 streaming 行为需要结合 `_transform` / `transform` 继续追。
- `Runnable` 与 prompt/model/parser/tool 的实际继承关系需要在后续单元继续绑定证据。
- 本轮还没有运行完整 Understand Anything LLM graph reviewer，当前图谱主要来自 deterministic scan。

