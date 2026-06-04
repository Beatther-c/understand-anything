# 06 Callback / Tracing

## 你会学到什么

- 为什么复杂 LLM 应用必须有 tracing。
- `BaseCallbackHandler` 和 `CallbackManager` 如何分工。
- `RunnableConfig.callbacks` 如何把 callback 系统挂进运行链路。
- `get_child(tag)` 如何形成父子 run 层级。
- 为什么 `RunnableSequence`、ChatModel、Tool 都要发运行生命周期事件。

## AI 概念从零解释

Agent 出错时，最终答案往往不是最有用的信息。你真正想知道的是：

```text
这次用了哪个 prompt？
模型返回了什么 tool call？
工具输入是什么？
工具返回了什么？
哪一步耗时最长？
哪一步抛错？
模型用了多少 token？
```

Callback / tracing 就是记录这些运行过程。它类似后端分布式 tracing，但对象从 HTTP service/span 变成了 prompt、model、tool、chain、retriever、agent step。

## 为什么工程上需要这个抽象

没有 tracing 的 Agent 很难调试：

- 模型最终回答错了，但不知道 prompt 有没有错。
- 工具没被调用，但不知道是 schema 不好还是模型没选择。
- 调用了错误工具，但不知道模型看到了什么 description。
- streaming 中途失败，但不知道哪一个 chunk 前后出错。
- 多步 chain 失败，但不知道是哪一步。

LangChain 用 callback handler 定义事件，用 callback manager 分发事件，用 run manager 表达一次 run 的生命周期和父子关系。

## 最小心智模型

```python
class Handler:
    def on_chain_start(self, name, inputs): ...
    def on_chain_end(self, outputs): ...
    def on_tool_start(self, tool, input): ...
    def on_llm_new_token(self, token): ...


class CallbackManager:
    def __init__(self, handlers, parent_run_id=None):
        self.handlers = handlers
        self.parent_run_id = parent_run_id

    def on_chain_start(self, serialized, inputs):
        run_id = new_id()
        for h in self.handlers:
            h.on_chain_start(serialized, inputs, run_id=run_id)
        return RunManager(run_id, self.handlers)
```

真实 LangChain 还要处理 sync/async、ignore flags、tags、metadata、inheritable handlers、LangSmith metadata 等。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- chain callback event: `libs/core/langchain_core/callbacks/base.py:386`
- tool callback event: `libs/core/langchain_core/callbacks/base.py:409`
- `BaseCallbackHandler`: `libs/core/langchain_core/callbacks/base.py:496`
- `ParentRunManager.get_child`: `libs/core/langchain_core/callbacks/manager.py:568`
- `CallbackManagerForChainRun.on_chain_end`: `manager.py:897`
- `CallbackManager`: `manager.py:1343`
- `on_llm_start`: `manager.py:1346`
- `on_chat_model_start`: `manager.py:1397`
- `on_chain_start`: `manager.py:1451`
- `configure`: `manager.py:1649`

## 源码阅读路径

1. 先看 `BaseCallbackHandler`：`base.py:496`，理解 handler 是事件接收者。
2. 看 `on_chain_start` 和 `on_tool_start` 的签名：`base.py:386`、`base.py:409`。
3. 看 `CallbackManager.on_llm_start`：`manager.py:1346`，理解事件如何分发给 handlers。
4. 看 `CallbackManager.on_chat_model_start`：`manager.py:1397`，理解 chat model tracing 的输入是 message list。
5. 看 `CallbackManager.on_chain_start`：`manager.py:1451`，理解它返回 run manager。
6. 看 `ParentRunManager.get_child`：`manager.py:568`，理解 child manager 如何继承 handlers、tags、metadata。
7. 回到 RunnableSequence.invoke，看每一步如何用 child callback manager 形成 `seq:step:n` 层级。

## 核心实体和关系

- `BaseCallbackHandler`：事件处理器基类。
- `CallbackManager`：事件分发器。
- `RunManager` / `ParentRunManager`：表示一次运行中的上下文。
- `CallbackManagerForChainRun`：chain run 的运行管理器。
- `RunnableConfig.callbacks`：把 callbacks 传入运行链路。
- `get_child(tag)`：创建子 run manager，保留父子关系。

## 关键 claims 与 evidence

- `claim-callback-manager-observes-run-lifecycle`：CallbackManager 和 callback handler 用生命周期事件观测 chain、model、tool 等运行过程。证据：`ev-callback-handler`、`ev-callback-manager`、`ev-runnable-config`。
- `BaseCallbackHandler` 聚合 LLM、Chain、Tool、Retriever、Run 等 mixin。证据：`callbacks/base.py:496`。
- `on_tool_start` 的签名包含 serialized、input_str、run_id、parent_run_id、tags、metadata。证据：`callbacks/base.py:409`。
- `get_child` 会创建带 `parent_run_id` 的 child callback manager。证据：`callbacks/manager.py:568` 到 `manager.py:584`。
- `CallbackManager.configure` 接收 inheritable/local callbacks、tags、metadata。证据：`callbacks/manager.py:1649`。

## 相关测试证据

- `ev-test-callback-manager-merge`：`tests/unit_tests/callbacks/test_sync_callback_manager.py:18-38` 验证 callback manager 合并时保留普通 handler 和 inheritable handler 的区别。
- `ev-test-async-callback-dispatch`：`tests/unit_tests/callbacks/test_async_callback_manager.py:31-75` 验证 async callback manager 作为 dispatcher 调用 handler，并区分 inline / 非 inline 执行。
- `ev-test-tracer-nested-run`：`tests/unit_tests/tracers/test_base_tracer.py:254-286` 验证 tracer 通过 `parent_run_id` 表达 chain -> tool -> llm 的嵌套运行。
- `ev-test-tracer-usage-metadata`：`tests/unit_tests/tracers/test_langchain.py:308-352` 验证 LLM 输出中的 usage metadata 会被写入 run metadata。

这些测试说明 tracing 不是日志打印，而是有 parent/child、metadata、handler 继承规则的运行时事件系统。

## 真实源码解释

`BaseCallbackHandler` 本身没有业务逻辑，它组合了多个 mixin：LLM、Chain、Tool、Retriever、CallbackManager、RunManager。这说明 LangChain 把不同运行对象的生命周期事件统一放在 callback handler 协议里。

`on_chain_start` 和 `on_tool_start` 的签名都包含 `run_id`、`parent_run_id`、`tags`、`metadata`。这几个字段是 tracing 的核心：run id 表示当前 span，parent run id 表示父子关系，tags 和 metadata 用于过滤、聚合和展示。

`CallbackManager.on_llm_start` 会为每个 prompt 生成 run id，调用 `handle_event` 分发事件，然后返回 `CallbackManagerForLLMRun`。这意味着 start 事件不仅是通知，它还产生后续 run 生命周期的管理对象。

`on_chat_model_start` 类似，但输入是 `list[list[BaseMessage]]`，说明 chat model tracing 记录的是 message list，而不是简单 prompt string。

`ParentRunManager.get_child` 是理解链式调用 tracing 的关键。它创建一个 `CallbackManager(handlers=[], parent_run_id=self.run_id)`，继承 handlers、tags、metadata，并可加一个本地 tag。RunnableSequence 可以用它为每一步创建 child manager，于是 tracing 里能看到层级结构。

## 设计取舍

收益：

- 调试 Agent 时可以看到每一步发生了什么。
- 父子 run 让 pipeline、model、tool 的层级清晰。
- tags 和 metadata 方便按业务、环境、实验分组。
- callback handler 可扩展，可以接控制台日志、LangSmith、自定义审计。
- sync/async callback 体系可以覆盖不同执行模式。

成本：

- callback 系统横跨 Runnable、ChatModel、Tool，阅读路径长。
- handler、manager、run manager 名字相似，初学者容易混淆。
- 事件多且分层，简单应用可能觉得抽象过重。
- tracing 本身也可能引入性能和隐私成本，需要控制记录内容。

## 和 Java 后端经验类比

可以类比成：

- OpenTelemetry span：run / child run。
- Servlet filter 或 Spring interceptor：运行前后事件。
- MDC / log context：tags、metadata、run_id。
- Event listener：callback handler。

差异是 LLM 应用的事件对象更丰富：prompt、message、token chunk、tool call、tool result 都是需要追踪的业务对象。

## 容易误解的点

- 误解 1：callback 是业务回调。这里主要是运行生命周期观测。
- 误解 2：tracing 就是打印日志。实际它有 run id、parent run id、tags、metadata 和层级。
- 误解 3：callbacks 只能全局配置。实际可以通过 `RunnableConfig` 在调用时传入。
- 误解 4：工具和模型 tracing 是两套东西。实际它们共享 callback handler / manager 协议。
- 误解 5：没有 tracing 也能稳定开发 Agent。简单 demo 可以，复杂 Agent 很快会不可调试。

## 自测题

见 `../quizzes/06-callback-tracing.quiz.md`。

## 掌握度验证

见 `../mastery/06-callback-tracing.mastery.md`。

## 最小复刻任务

见 `../labs/06-mini-callback-tracer/README.md`。

## 学完标准

你应该能不看笔记解释：

- callback handler 和 callback manager 的分工。
- `run_id` 和 `parent_run_id` 为什么重要。
- `get_child(tag)` 如何形成链路层级。
- `RunnableConfig.callbacks` 如何进入运行链路。
- tracing 对 Agent 调试的价值和成本。

