# 01 Runnable Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释 Runnable 解决了什么问题。

完成标准：

- 说到统一执行协议。
- 说到组合。
- 说到 batch / stream / async 至少两个能力。

## Level 2: 源码定位

在源码中定位以下符号，并记录文件和行号：

- `Runnable`
- `Runnable.__or__`
- `Runnable.batch`
- `Runnable.stream`
- `RunnableSequence`
- `RunnableSequence.invoke`
- `RunnableLambda`
- `RunnableConfig`

## Level 3: 调用链追踪

追踪下面这段代码的执行链：

```python
chain = RunnableLambda(lambda x: x + 1) | RunnableLambda(lambda x: x * 2)
chain.invoke(1)
```

要求写出：

1. `|` 如何创建 `RunnableSequence`。
2. `chain.invoke(1)` 如何遍历 steps。
3. 每一步的输入输出是什么。
4. 为什么这里不是把两个函数的输入输出“拼接”在一起。

## Level 4: 图谱重建

不看 `graph/relations.json`，手写以下实体关系：

- `Runnable`
- `RunnableSequence`
- `RunnableLambda`
- `RunnableConfig`
- `invoke`
- `batch`
- `stream`
- `callbacks`

## Level 5: 故障诊断

假设你写了一个自定义 Runnable，`stream()` 没有逐 token 输出，而是最后一次性输出完整结果。根据本课内容，判断可能原因。

要求至少覆盖：

- 默认 `stream` 的行为。
- `transform` 是否实现。
- pipeline 中是否存在默认 `RunnableLambda` 这类会阻塞 streaming 的步骤。

## Level 6: 微改造

在 `labs/01-mini-runnable` 中增加：

- `with_config(config)` 方法。
- `max_concurrency` 控制。
- 一个简单 callback hook：`on_start` / `on_end`。

说明你的实现和 LangChain `RunnableConfig` 的差异。

## Level 7: 术语校正

用准确术语改写下面几句话：

1. “Runnable 主要是为了把大模型输入接口标准化。”
2. “batch 是多模态输入。”
3. “RunnableSequence 是把 A 和 B 的输入输出拼起来。”
4. “RunnableLambda 适合所有自定义函数，包括真正流式处理。”

完成标准：

- 能区分执行协议、数据 schema、输入样本数量和数据模态。
- 能解释 `RunnableLambda` 与 `RunnableGenerator` 的差异。
