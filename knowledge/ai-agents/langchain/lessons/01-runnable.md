# 01 Runnable

## 你会学到什么

- LLM 应用为什么需要统一的“可执行组件”抽象。
- `Runnable`、`RunnableSequence`、`RunnableLambda`、`RunnableConfig` 分别承担什么职责。
- `invoke`、`batch`、`stream` 的差异。
- `a | b` 为什么会变成 `RunnableSequence`。
- 这个抽象如何迁移到自己的 Agent harness。

## AI 概念从零解释

一个 LLM 应用通常不是“调用一次模型”这么简单。真实应用会把多个步骤串起来：

```text
用户输入 -> PromptTemplate -> ChatModel -> OutputParser -> 后续业务逻辑
```

如果每一步都是随意的函数，框架就很难统一支持：

- 单次调用。
- 批量调用。
- 流式输出。
- 异步调用。
- 运行配置。
- tracing 和 callback。
- 错误恢复和重试。
- 组合多个步骤。

`Runnable` 就是 LangChain 给这些步骤设计的统一执行接口。你可以先把它理解成“LLM 应用里的统一 Handler 接口”，但它比普通 Java `Handler` 多了批处理、流式、异步、schema 和 tracing 的语义。

这里的 “Handler 统一接口” 指的是：不同对象虽然内部实现完全不同，但外部都暴露同一种调用方式。比如在 Java 后端里，一个 HTTP controller、一个过滤器、一个消息消费者、一个任务处理器，内部逻辑可能差很多，但框架希望它们都能被某个统一入口调度。`Runnable` 在 LangChain 里做的就是类似事情：不管内部是 prompt 模板、模型调用、输出解析器、检索器还是普通函数，外部都尽量用 `invoke(input)`、`batch(inputs)`、`stream(input)` 这套统一协议来调用。

所以这句话不是要你先理解某个具体的 Java `Handler` 类，而是要抓住这个工程直觉：框架把“很多不同类型的步骤”包装成“同一种可调度对象”，这样后面才能组合、批处理、流式输出和追踪。

这和责任链模式有相似处，但不要完全等同。责任链通常强调“一个请求沿着一串 handler 传递，某个 handler 可以处理或继续传递”。`RunnableSequence` 更强调“每一步都执行，并且上一步输出变成下一步输入”。所以它更像 pipeline：

```text
input -> step_1 -> intermediate -> step_2 -> output
```

如果放到 Java 后端经验里，可以先把它理解成“带执行协议的 Pipeline Step”，而不是某个固定的 `Handler` 类。

## 为什么工程上需要这个抽象

从后端工程角度看，LangChain 面临的问题类似“不同组件都能处理请求，但输入输出、并发、观测、生命周期都不统一”。`Runnable` 把这些差异收敛到同一套执行协议：

- `invoke`：单输入单输出。
- `batch`：多输入批处理。
- `stream`：单输入流式输出。
- `ainvoke` / `abatch` / `astream`：异步版本。
- `config`：运行配置，包含 callbacks、tags、metadata、max_concurrency 等。
- `|` / `pipe`：声明式组合。

这里的 `config` 不是业务输入，而是“这次运行怎么被观测、标记和调度”的配置：

- `callbacks`：生命周期回调。比如开始执行、结束执行、出错、流式输出 chunk 时通知 tracer 或 logger。
- `tags`：标签。比如给某次调用打上 `["agent", "demo"]`，后面在 tracing 或日志里筛选。
- `metadata`：结构化元数据。比如 `user_id`、`request_id`、`experiment`，用于排查和分析。
- `max_concurrency`：并发上限。主要影响 `batch` 这种多个输入并发执行的场景。

一个容易混淆的点是 `batch` 的“多输入”。这里的多输入不是指多模态，而是指多个独立输入样本：

```python
r.invoke("问题1")
r.batch(["问题1", "问题2", "问题3"])
```

每个输入样本本身可以是字符串、dict、message list，也可以包含图片等多模态内容；但 `batch` 的核心语义是“同一个 Runnable 同时处理 N 个独立请求”。

## 最小心智模型

可以先用下面的伪代码建立直觉：

```python
class MiniRunnable:
    def invoke(self, input, config=None):
        raise NotImplementedError

    def batch(self, inputs, config=None):
        return [self.invoke(x, config) for x in inputs]

    def stream(self, input, config=None):
        yield self.invoke(input, config)

    def __or__(self, other):
        return MiniSequence([self, other])


class MiniSequence(MiniRunnable):
    def __init__(self, steps):
        self.steps = steps

    def invoke(self, input, config=None):
        value = input
        for step in self.steps:
            value = step.invoke(value, config)
        return value
```

LangChain 的真实实现复杂很多，但心智模型就是：把每个步骤变成统一可执行对象，再把对象组合成 pipeline。

这里的 `steps` 就是 pipeline 里的步骤列表，不是额外的新概念。比如：

```python
chain = RunnableLambda(add_one) | RunnableLambda(mul_two)
```

可以先把它想成：

```text
steps[0] = RunnableLambda(add_one)
steps[1] = RunnableLambda(mul_two)
```

执行 `chain.invoke(1)` 时：

```text
value = 1
value = steps[0].invoke(value)  # add_one(1) -> 2
value = steps[1].invoke(value)  # mul_two(2) -> 4
return value
```

所以 `RunnableSequence` 不是把 A 和 B 的输入输出“拼接”起来，而是把 A 的输出传给 B。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- path: `libs/core/langchain_core/runnables/base.py`
- related config: `libs/core/langchain_core/runnables/config.py`
- related tests:
  - `libs/core/tests/unit_tests/runnables/test_concurrency.py`
  - `libs/core/tests/unit_tests/runnables/test_runnable_events_v2.py`

## 源码阅读路径

1. 先看 `Runnable` 类的 docstring：`base.py:125`。
2. 再看 `Runnable.__or__`：`base.py:619`，理解 `|` 如何创建 `RunnableSequence`。
3. 看 `Runnable.invoke` / `batch` / `stream`：`base.py:823`、`base.py:868`、`base.py:1131`。
4. 看 `RunnableSequence` 类：`base.py:2995`。
5. 看 `RunnableSequence.invoke`：`base.py:3309`，理解步骤如何顺序执行。
6. 看 `RunnableLambda`：`base.py:4577`，理解普通函数如何进入 Runnable 体系。
7. 看 `RunnableConfig`：`config.py:49`，理解运行配置。

## 核心实体和关系

- `Runnable`：统一执行抽象。
- `RunnableSequence`：顺序组合多个 Runnable。
- `RunnableLambda`：把 Python callable 包装成 Runnable。
- `RunnableConfig`：承载 tracing、metadata、并发限制等运行配置。
- `Runnable.__or__ -> RunnableSequence`：`|` 操作符创建组合。
- `Runnable.batch -> invoke`：默认批处理并发调用单次执行。
- `Runnable.stream -> invoke`：默认 stream 只是包一层单次输出。

## 关键 claims 与 evidence

- `claim-runnable-unifies-execution`：Runnable 统一单次调用、批处理、流式、异步和组合。证据：`ev-runnable-class-doc`、`ev-runnable-invoke`、`ev-runnable-batch`、`ev-runnable-stream`。
- `claim-or-creates-sequence`：`|` 创建 `RunnableSequence`。证据：`ev-runnable-or`。
- `claim-batch-default-parallel-invoke`：默认 `batch` 并发调用 `invoke`。证据：`ev-runnable-batch`、`ev-test-batch-concurrency`。
- `claim-stream-default-wraps-invoke`：默认 `stream` 只是 yield `invoke`。证据：`ev-runnable-stream`。
- `claim-lambda-wraps-callable`：`RunnableLambda` 包装普通 callable。证据：`ev-runnable-lambda-class`、`ev-runnable-lambda-invoke`。

## 真实源码解释

`Runnable` 的 docstring 明确把它定义为可以 invoked、batched、streamed、transformed、composed 的工作单元。它不是普通函数接口，而是一个带运行协议的抽象。

`Runnable.__or__` 返回：

```python
RunnableSequence(self, coerce_to_runnable(other))
```

这说明 `a | b` 的核心语义是构造顺序执行链。`coerce_to_runnable` 也暗示 LangChain 会把 Runnable-like 对象转成真正 Runnable。

`Runnable.batch` 的默认实现先把 config 展开成 config list，然后定义内部 `invoke` 包装函数。多输入时，它通过 executor map 并发执行。这个默认实现适合 IO bound 的组件，例如模型 API 调用。

`Runnable.stream` 的默认实现只有一行核心逻辑：

```python
yield self.invoke(input, config, **kwargs)
```

所以默认 stream 不等于真正流式。真正 token/chunk 级流式需要子类实现 `transform` 或覆盖 stream。

可以用下面这个差异理解“伪流式”和“真流式”：

```python
# 默认 stream：只是在最后 yield 一次完整结果
for chunk in runnable.stream(input):
    print(chunk)  # 通常只打印一次

# 真正流式：一边生成一边 yield
for chunk in chat_model.stream(messages):
    print(chunk)  # 可能打印很多次 token / message chunk
```

`RunnableSequence` 的流式能力取决于中间每个 step 是否能传递 chunk。源码 docstring 里明确说，如果所有组件都实现 `transform`，sequence 就能把 streaming input 映射到 streaming output；如果某个组件没有实现，流会在这个组件处被阻塞，直到它运行完成。

这也是为什么 `RunnableLambda` 要单独理解。它能把普通 Python callable 包装成 Runnable：

```python
from langchain_core.runnables import RunnableLambda

add_one = RunnableLambda(lambda x: x + 1)
```

它的价值是接入成本很低：普通函数马上可以参与 `invoke`、`batch`、`|` 组合和 tracing。它的局限是，普通函数通常要拿到完整输入后才返回完整输出，所以默认不适合真正 token/chunk 级 streaming。需要流式处理任意 chunk 时，更应该看 `RunnableGenerator` 或自定义 `transform`。

`RunnableSequence.invoke` 会遍历 `self.steps`，每一步都执行 `step.invoke`，并把上一步结果作为下一步输入。它还会为每个 step patch callbacks，使 tracing 能看到 `seq:step:1`、`seq:step:2` 这种层级。

源码里的 `step` 就是 `self.steps` 列表里的一个 Runnable。`RunnableSequence` 内部有 `first`、`middle`、`last`，`steps` 会把这些组合起来形成顺序列表。执行时大致是：

```python
input_ = input
for i, step in enumerate(self.steps):
    input_ = step.invoke(input_, config)
return input_
```

第一步会接收外部输入；从第二步开始，每一步都接收上一步的输出。

## 设计取舍

收益：

- 统一组件调用协议。
- 组合链可以自动拥有 sync / async / batch / streaming 能力。
- config 在链路中传递，便于 tracing、metadata 和并发控制。
- 普通函数可以通过 `RunnableLambda` 快速接入。

成本：

- 抽象层较厚，初学者不容易判断真正执行点在哪里。
- streaming 语义容易误解，默认 `stream` 不代表真正流式。
- `RunnableConfig` 贯穿链路，阅读源码时要同时追 config 和 callbacks。

## 和 Java 后端经验类比

可以把 `Runnable` 类比成更强的 `Handler<I, O>`，但它同时内置：

- 类似 `CompletableFuture` / executor 的异步和批处理。
- 类似 FilterChain 的链式组合。
- 类似 Spring `HandlerAdapter` 的统一适配。
- 类似 AOP / interceptor 的 callbacks 和 tracing。

但不要过度类比。LangChain 的核心差异是：它必须同时处理 LLM 输出、流式 token、tool call、prompt schema、provider adapter 等 LLM 应用特有问题。

如果要在自己的 Agent harness 里迁移这个思路，建议先固定“执行形态”，再让具体组件自由实现内部逻辑：

```python
class AgentStep:
    def invoke(self, input, config=None): ...
    def batch(self, inputs, config=None): ...
    def stream(self, input, config=None): ...
    def pipe(self, next_step): ...
```

哪些东西适合做成这种 step？

- prompt 渲染。
- 模型调用。
- tool 执行。
- output parser。
- retriever 查询。
- guardrail / middleware。

重点不是规定所有组件必须使用同一种具体数据结构，而是规定它们都遵守同一套执行协议。具体输入输出类型应由 schema、类型参数或文档约束。

## 容易误解的点

- 误解 1：`Runnable` 只是普通函数。实际它是执行协议。
- 误解 2：`stream` 默认就是 token 流。实际默认只是 yield 一次 `invoke` 结果。
- 误解 3：`|` 只是 Python 语法糖。实际它创建了 `RunnableSequence`，后续 batch/tracing/stream 都围绕这个对象展开。
- 误解 4：`RunnableLambda` 适合所有自定义逻辑。实际需要真正 streaming 时，更应该看 `RunnableGenerator` 或自定义 `transform`。
- 误解 5：`batch` 的多输入就是多模态。实际它主要指多个独立输入样本；多模态是单个样本内部的数据形态。
- 误解 6：`RunnableSequence` 会把 A 和 B 的输入输出拼接。实际是 A 的输出传给 B，像 pipeline，不像字符串拼接。

## 学习者笔记校正

本节根据学习标注补充以下校正点：

- “统一 Handler 接口”可以理解为统一外部调用协议，但 `Runnable` 比普通 handler 多了 batch、stream、async、config 和 tracing。
- `invoke`、`batch`、`stream` 三个词容易被语音输入识别错。准确含义分别是单输入单输出、多输入批处理、单输入迭代式输出。
- `RunnableSequence` 的 `sequence` 是顺序链路，不是拼接。执行规则是 `B(A(input))`。
- `RunnableLambda` 很重要，因为它让普通函数进入 Runnable 体系；但它默认会消费完整输入再输出，不适合需要边收边发的真正流式场景。
- 自研 Agent harness 时，可以先设计统一执行协议，再让 prompt、model、tool、parser、retriever 等不同组件各自实现。

## 自测题

见 `../quizzes/01-runnable.quiz.md`。

## 掌握度验证

见 `../mastery/01-runnable.mastery.md`。

## 最小复刻任务

见 `../labs/01-mini-runnable/README.md`。

## 学完标准

你应该能不看笔记解释：

- 为什么 LangChain 需要 Runnable。
- `invoke`、`batch`、`stream` 的默认语义分别是什么。
- `a | b` 如何变成 `RunnableSequence`。
- `RunnableLambda` 的价值和局限。
- 如果在自己的 Agent harness 里引入 Runnable 思路，接口会怎么设计。
