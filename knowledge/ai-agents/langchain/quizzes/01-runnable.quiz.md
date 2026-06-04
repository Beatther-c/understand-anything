# 01 Runnable Quiz

## 概念题

1. 为什么 LLM 应用需要 `Runnable` 这种统一执行抽象，而不是直接使用普通函数？
2. `invoke`、`batch`、`stream` 分别表达什么执行语义？
3. 为什么默认 `stream` 不等于真正的 token/chunk 流式输出？
4. `RunnableConfig` 为什么要包含 tags、metadata、callbacks、max_concurrency？
5. `batch` 的“多输入”和“多模态输入”有什么区别？

## 源码题

1. 找到 `Runnable.__or__` 的实现，说明它返回了什么对象。
2. 找到 `RunnableSequence.invoke`，写出它执行 steps 的顺序。
3. 找到 `Runnable.batch`，说明单输入和多输入时行为有什么不同。
4. 找到 `RunnableSequence` 的 docstring，说明它如何描述 streaming 与 `transform` 的关系。

## 设计题

1. 如果你要在 Java 中设计一个类似 Runnable 的接口，你会把 `batch` 和 `stream` 放在同一个接口里，还是拆成多个接口？为什么？
2. `RunnableLambda` 让普通函数快速进入框架，但它可能带来哪些可维护性问题？
3. 如果一个 pipeline 中间放了一个默认 `RunnableLambda`，它可能如何影响真正流式输出？

## 迁移题

1. 如果你要做一个自己的 Agent harness，哪些组件适合做成 Runnable？哪些不适合？
2. 用自己的话写出 `A | B | C` 的执行顺序，不允许使用“拼接”这个词。
