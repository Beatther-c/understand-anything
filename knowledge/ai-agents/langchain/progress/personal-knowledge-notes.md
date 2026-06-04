# Personal Knowledge Notes

## 01 Runnable

这些笔记来自学习 `01-runnable` 时的页面标注。保留原始语音输入的意思，但将术语和理解校正成后续可复用的知识点。

### Runnable 是统一执行协议

原始理解：

> 把接口抽象出来，所有入口都变成统一接口，类似责任链模式中的 handle。

校正后：

`Runnable` 的核心不是某个具体 `Handler` 类，而是统一执行协议。它把 prompt、model、parser、retriever、tool、普通函数等不同组件包装成“同一种可调度对象”。

和 Java 后端类比：

- 像统一 `Handler<I, O>`：外部都能通过统一方法调用。
- 像责任链：多个步骤可以按顺序传递结果。
- 但它比普通 `handle` 多了 `batch`、`stream`、async、config、schema、tracing 等语义。

### invoke / batch / stream

原始理解：

> invoke 是单输入，batch 是多输入，stream 应该是单输入流式输出。

校正后：

- `invoke(input)`：单输入单输出。
- `batch(inputs)`：多个独立输入分别执行，返回多个输出。
- `stream(input)`：单输入、迭代式输出。

注意：默认 `stream` 只是把完整 `invoke` 结果 `yield` 一次，不一定是真正 token/chunk 级流式。

### batch 的“多输入”

`batch` 的多输入不是指多模态，而是多个独立请求样本。

例如：

```python
r.invoke("问题1")
r.batch(["问题1", "问题2", "问题3"])
```

每个输入样本本身可以是字符串、dict、message list，也可以包含多模态内容；但 `batch` 关注的是“有多少个输入样本要跑同一个 Runnable”。

### RunnableSequence

原始理解：

> 可能是把 A 和 B 的输入输出拼在一起。

校正后：

`RunnableSequence` 不是拼接输入输出，而是顺序传递。

```text
A(input) -> intermediate
B(intermediate) -> final
```

`a | b` 创建的是一个 sequence。调用 `sequence.invoke(input)` 时，先执行 `a.invoke(input)`，再把结果交给 `b.invoke(...)`。

### step 是什么

`step` 不是新概念，它就是 `RunnableSequence` 里保存的某一个 `Runnable`。

例如：

```python
chain = RunnableLambda(add_one) | RunnableLambda(mul_two)
```

这里的 `steps` 可以理解为：

```text
steps[0] = RunnableLambda(add_one)
steps[1] = RunnableLambda(mul_two)
```

执行时循环遍历 `steps`，每一步把上一步的输出作为下一步的输入。

### RunnableLambda

`RunnableLambda` 的价值是把普通 Python 函数快速接入 Runnable 体系，让普通函数也能参与 `invoke`、`batch`、`|` 组合和 tracing。

它的局限是默认不适合真正流式处理。普通函数通常要先拿到完整输入，处理完后一次性输出。如果需要边接收 chunk 边输出 chunk，应优先看 `RunnableGenerator` 或自定义 `transform`。

### 自研 Agent Harness 的迁移理解

如果在自己的 Agent harness 中引入 Runnable 思路，先固定外部执行协议：

- `invoke`
- `batch`
- `stream`
- async 版本
- `pipe` / `|` 组合
- `config`

然后让不同内部实现分别承担：

- prompt 渲染
- 模型调用
- tool 执行
- output parsing
- retriever 查询
- guardrail / middleware

重点不是规定所有组件必须有同一种数据结构，而是规定它们都遵守同一套执行形态。具体输入输出类型应由 schema 或类型参数表达。
