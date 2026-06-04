# 04 ChatModel Adapter

## 你会学到什么

- ChatModel adapter 为什么是 LLM 应用框架最重要的边界之一。
- `BaseChatModel` 如何统一 `invoke`、`stream`、`batch`、`bind_tools` 等接口。
- `invoke` 如何把输入转换为 message，再调用底层生成逻辑。
- `stream` 为什么可能 fallback 到 `invoke`。
- provider 子类为什么要实现 `_generate`，并可选实现 `_stream` 和 `bind_tools`。

## AI 概念从零解释

不同模型服务的 API 并不统一。即使都叫 chat model，它们也可能在这些方面不同：

- 输入消息格式不同。
- 输出消息结构不同。
- streaming chunk 格式不同。
- tool call 字段不同。
- token usage 字段不同。
- 错误码和重试语义不同。
- 是否支持 structured output 不同。

上层 Agent 不应该直接依赖某一家 provider 的 API。ChatModel adapter 的作用就是把“具体模型服务”包装成统一的模型接口。

## 为什么工程上需要这个抽象

如果没有 ChatModel adapter，Agent loop 会被 provider 细节污染：

```text
if provider == "openai":
  parse choices[0].message.tool_calls
elif provider == "anthropic":
  parse content blocks
elif provider == "xxx":
  parse another shape
```

这会让工具调用、streaming、tracing、重试、结构化输出都变成分散的条件分支。`BaseChatModel` 把这些差异收敛到统一协议，上层只面向 `AIMessage` 和 Runnable。

## 最小心智模型

```python
class MiniChatModel:
    def invoke(self, input, config=None):
        messages = self.convert_input(input)
        result = self._generate(messages)
        return result.message

    def stream(self, input, config=None):
        if not self.supports_stream:
            yield self.invoke(input, config)
            return
        for chunk in self._stream(self.convert_input(input)):
            yield chunk

    def _generate(self, messages):
        raise NotImplementedError
```

核心思想是：base class 负责统一协议和公共流程，provider subclass 负责真正调用厂商 API。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- base model: `libs/core/langchain_core/language_models/chat_models.py:270`
- imperative methods table: `chat_models.py:273`
- declarative methods table: `chat_models.py:290`
- invoke: `chat_models.py:461`
- stream: `chat_models.py:713`
- `_generate`: `chat_models.py:2181`
- `_stream`: `chat_models.py:2227`
- `bind_tools`: `chat_models.py:2325`

## 源码阅读路径

1. 先看 `BaseChatModel` docstring 中的 imperative methods 表：`chat_models.py:273`。
2. 再看 declarative methods 表：`chat_models.py:290`，尤其是 `bind_tools`、`with_structured_output`、`with_retry`。
3. 看 `_convert_input` 附近逻辑，理解 str、messages、PromptValue 如何变成统一输入。
4. 看 `invoke`：`chat_models.py:461`，理解它如何调用 `generate_prompt` 并取第一条 message。
5. 看 `stream`：`chat_models.py:713`，理解不支持 streaming 时如何 fallback。
6. 看 `_generate`：`chat_models.py:2181`，这是 provider 必须实现的核心方法。
7. 看 `_stream` 和 `bind_tools`：理解 provider 能力如何挂到统一抽象上。

## 核心实体和关系

- `BaseChatModel`：chat model 统一抽象。
- `AIMessage`：`invoke` 的标准输出。
- `ChatGeneration` / `ChatResult`：provider 生成结果的中间结构。
- `_generate`：provider 子类必须实现的同步生成方法。
- `_stream`：provider 子类可实现的流式生成方法。
- `bind_tools`：把工具 schema 绑定到模型调用上的能力。
- `BaseChatModel -> Runnable`：ChatModel 也参与 Runnable pipeline。

## 关键 claims 与 evidence

- `claim-chat-model-adapter-normalizes-providers`：BaseChatModel 把不同 provider 调用统一到 `invoke`、`stream`、`batch`、`bind_tools` 等接口上。证据：`ev-base-chat-model`、`ev-base-chat-model-invoke`、`ev-base-chat-model-stream`。
- `BaseChatModel` 文档列出 `invoke`、`stream`、`batch` 等 imperative methods。证据：`chat_models.py:273` 到 `chat_models.py:288`。
- `invoke` 通过 `_convert_input` 和 `generate_prompt` 返回 `AIMessage`。证据：`chat_models.py:461` 到 `chat_models.py:485`。
- `stream` 在模型不支持流式时会 yield `invoke` 的结果。证据：`chat_models.py:721` 到 `chat_models.py:726`。
- `_generate` 是抽象方法，provider 实现真正请求。证据：`chat_models.py:2181`。
- `bind_tools` 在 base 层声明把工具绑定到模型。证据：`chat_models.py:2325`。

## 相关测试证据

- `ev-test-chat-model-batch-tracing`：`tests/unit_tests/language_models/chat_models/test_base.py:111-132` 验证 chat model 的 batch、invoke、stream 都能进入统一 tracing，并记录 batch_size。
- `ev-test-chat-model-stream-fallback`：`tests/unit_tests/language_models/chat_models/test_base.py:197-220` 验证只实现 `_generate` 的模型也能通过 `stream` fallback 工作。
- `ev-test-fake-chat-model-modes`：`tests/unit_tests/fake/test_fake_chat_model.py:26-72` 验证 fake chat model 在 invoke、ainvoke、stream、astream 下保持一致接口。

这些测试说明 adapter 层的核心不是“调用某个 API”，而是把不同执行形态压进一个稳定契约。

## 真实源码解释

`BaseChatModel` 的 docstring 很像一份接口契约表。它把方法分成两类：imperative methods 是实际调用模型的方法，declarative methods 是创建新 Runnable wrapper 的方法。

`invoke` 的流程可以压缩成：

```text
input -> _convert_input -> generate_prompt -> generations[0][0].message
```

这说明 `invoke` 对上层隐藏了 batch prompt generation、generation wrapper 和 provider 返回结构，最终只给调用者一个标准 `AIMessage`。

`stream` 的第一段判断非常重要：如果 `_should_stream` 返回 false，它不会报错，而是 yield 一次 `invoke` 结果。这和 Runnable 的默认 `stream` 类似，提醒你“调用 stream API”不等于“底层真的 token 流式输出”。

真正的 provider 工作在 `_generate` 里发生。`BaseChatModel._generate` 是抽象方法，签名接收 `list[BaseMessage]`、`stop`、`run_manager` 和 provider kwargs，返回 `ChatResult`。这就是 OpenAI、Anthropic、Google 等 adapter 需要实现的地方。

`bind_tools` 的存在说明 tool calling 是模型 adapter 的一部分。工具 schema 由 Tool 定义，但如何把 schema 变成 provider 支持的格式，是模型 provider adapter 的职责。

## 设计取舍

收益：

- 上层 Agent 只依赖统一 ChatModel。
- provider 差异集中在 adapter 子类。
- Runnable 能力让模型自然参与 `prompt | model | parser`。
- callbacks、tags、metadata、run_id 能在模型调用中传递。
- streaming 和 tool binding 有统一入口。

成本：

- base class 很厚，阅读时要区分公共流程和 provider 实现。
- streaming fallback 容易让人误以为所有模型都支持真正流式。
- tool calling 能力横跨 Tool、Message、Provider 三层，调试时需要跨文件追踪。
- `generate_prompt`、`ChatGeneration`、`ChatResult` 这些中间层会增加理解门槛。

## 和 Java 后端经验类比

可以把 `BaseChatModel` 类比成支付网关或短信网关接口：

- `invoke` 类似 `send(request)`。
- `_generate` 类似具体厂商 SDK 调用。
- `stream` 类似可选的 SSE/Reactive 能力。
- `bind_tools` 类似把业务 command schema 转成厂商 API schema。
- callbacks 类似 tracing interceptor。

但 LLM provider adapter 更复杂，因为输出不是简单响应体，还可能包含 tool calls、token usage、stream chunks 和结构化输出。

## 容易误解的点

- 误解 1：ChatModel 就是 OpenAI client。实际它是跨 provider 抽象。
- 误解 2：`invoke` 直接返回 provider 原始 JSON。实际返回标准化 `AIMessage`。
- 误解 3：调用 `stream` 就一定是真 streaming。实际可能 fallback 到 `invoke`。
- 误解 4：Tool 绑定只属于 Tool 层。实际 provider adapter 必须把工具转成模型 API 支持的格式。
- 误解 5：`_generate` 是给业务代码调用的。实际它是子类实现点，上层通常调 `invoke`。

## 自测题

见 `../quizzes/04-chat-model-adapter.quiz.md`。

## 掌握度验证

见 `../mastery/04-chat-model-adapter.mastery.md`。

## 最小复刻任务

见 `../labs/04-mini-chat-model-adapter/README.md`。

## 学完标准

你应该能不看笔记解释：

- 为什么 Agent 不应该直接依赖 provider SDK。
- `invoke` 如何把输入转换为 `AIMessage`。
- `stream` fallback 的语义是什么。
- provider 子类为什么必须实现 `_generate`。
- `bind_tools` 为什么属于 ChatModel adapter 的边界。

