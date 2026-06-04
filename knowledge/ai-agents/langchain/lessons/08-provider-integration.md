# 08 Provider Integration

## 你会学到什么

- Provider integration 为什么是 ChatModel adapter 的具体落地。
- `BaseChatOpenAI` 如何继承 `BaseChatModel` 并包装 OpenAI API。
- OpenAI adapter 如何处理 API key、model 参数、streaming、generate。
- `bind_tools` 如何把 LangChain tool-like 对象转换为 OpenAI tool schema。
- provider adapter 如何吸收 API 差异，避免污染上层 Agent。

## AI 概念从零解释

Provider 是模型服务提供方，例如 OpenAI、Anthropic、Google、DeepSeek、OpenRouter。它们都可能提供“聊天模型”，但 API 细节通常不同：

- 认证方式不同。
- model 参数不同。
- messages payload 格式不同。
- streaming chunk 格式不同。
- tool calling schema 不同。
- structured output 语义不同。
- token usage 和 response metadata 字段不同。

Provider integration 的职责是把这些具体差异封装起来，对上层暴露统一的 ChatModel 能力。

## 为什么工程上需要这个抽象

如果上层 Agent 直接依赖 OpenAI payload，一旦换 provider，就会改动 prompt、tool、agent loop、tracing 等大量代码。Provider adapter 把变化限制在边界层：

```text
Agent / Chain / Tool
  -> BaseChatModel
  -> ChatOpenAI / ChatAnthropic / ...
  -> Provider SDK / HTTP API
```

这样上层主要依赖 `AIMessage`、`BaseMessage`、`BaseTool`、`Runnable`，而 provider adapter 负责协议转换。

## 最小心智模型

```python
class MiniOpenAIChatModel(BaseChatModel):
    def _generate(self, messages, **kwargs):
        payload = self.to_openai_payload(messages, **kwargs)
        response = openai_client.chat.completions.create(**payload)
        return self.to_chat_result(response)

    def _stream(self, messages, **kwargs):
        payload = self.to_openai_payload(messages, stream=True, **kwargs)
        for chunk in openai_client.chat.completions.create(**payload):
            yield self.to_generation_chunk(chunk)

    def bind_tools(self, tools, tool_choice=None):
        openai_tools = [convert_to_openai_tool(t) for t in tools]
        return self.bind(tools=openai_tools, tool_choice=tool_choice)
```

真实 LangChain 的 OpenAI adapter 还要处理 responses API、response_format、include_response_headers、stream usage、parallel_tool_calls、strict schema、OpenAI 错误等。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- `BaseChatOpenAI`: `libs/partners/openai/langchain_openai/chat_models/base.py:581`
- model name: `base.py:599`
- API key: `base.py:608`
- `_stream`: `base.py:1549`
- `_generate`: `base.py:1624`
- `bind_tools`: `base.py:2131`
- tool conversion: `base.py:2171`
- `tool_choice="any"` compatibility: `base.py:2200`
- `ChatOpenAI`: `base.py:2534`

## 源码阅读路径

1. 先看 `BaseChatOpenAI(BaseChatModel)`：`base.py:581`，确认 provider adapter 继承 core 抽象。
2. 看 `model_name`、`temperature`、`model_kwargs`、`openai_api_key`：`base.py:599` 到 `base.py:612`。
3. 看 `_stream`：`base.py:1549`，理解 stream payload 和 chunk 转换。
4. 看 `_generate`：`base.py:1624`，理解普通生成、responses API、response_format 分支。
5. 看 `bind_tools`：`base.py:2131`，理解工具 schema 如何转换。
6. 看 `convert_to_openai_tool`：`base.py:2171`。
7. 看 `tool_choice == "any"` 转 `"required"`：`base.py:2200`。
8. 看 `ChatOpenAI`：`base.py:2534`，理解面向用户的 OpenAI chat model 类。

## 核心实体和关系

- `BaseChatOpenAI`：OpenAI chat model adapter 基类。
- `ChatOpenAI`：面向用户的 OpenAI chat model 类。
- `BaseChatModel`：provider adapter 继承的 core 抽象。
- `_generate`：同步非流式请求实现。
- `_stream`：流式请求实现。
- `bind_tools`：工具绑定与 provider schema 转换。
- `convert_to_openai_tool`：LangChain tool-like 对象到 OpenAI tool schema 的转换函数。

## 关键 claims 与 evidence

- `claim-openai-provider-adapter-handles-api-drift`：OpenAI provider adapter 处理模型参数、stream/generate、tool schema 转换和 tool_choice 兼容差异。证据：`ev-base-chat-openai`、`ev-openai-stream-generate`、`ev-openai-bind-tools`、`ev-openai-tool-conversion`、`ev-chat-openai`。
- `BaseChatOpenAI` 继承 `BaseChatModel`。证据：`base.py:581`。
- `openai_api_key` 可从 `OPENAI_API_KEY` 环境变量推断。证据：`base.py:608` 到 `base.py:616`。
- `_stream` 设置 `kwargs["stream"] = True` 并逐 chunk 转成 `ChatGenerationChunk`。证据：`base.py:1549` 到 `base.py:1608`。
- `_generate` 构造 payload，并根据 `response_format` / responses API 走不同分支。证据：`base.py:1624` 到 `base.py:1660`。
- `bind_tools` 使用 `convert_to_openai_tool` 转换工具。证据：`base.py:2131` 到 `base.py:2173`。
- OpenAI 不原生支持 `"any"`，adapter 将其转成 `"required"`。证据：`base.py:2200` 到 `base.py:2203`。

## 相关测试证据

- `ev-test-openai-responses-tool-call-conversion`：`libs/partners/openai/tests/unit_tests/chat_models/test_base.py:2323-2458` 验证 OpenAI adapter 把 `AIMessage.tool_calls` 转成 Responses API `function_call`，并把 `ToolMessage` 转成 `function_call_output`。
- `ev-test-openai-bind-tools-responses`：`libs/partners/openai/tests/unit_tests/chat_models/test_base.py:2627-2673` 验证 Responses API 模式下 `ChatOpenAI.bind_tools` 后仍能通过 mock client 调用并进入 tracing。
- `ev-test-openai-custom-tool`：`libs/partners/openai/tests/unit_tests/test_tools.py:39-82` 验证 OpenAI custom tool 的定义和 message history 回放。

这些测试说明 provider adapter 的复杂度来自双向转换：LangChain 标准 message/tool schema 要变成 provider payload，provider 返回也要能回到 LangChain 标准对象。

## 真实源码解释

`BaseChatOpenAI(BaseChatModel)` 是 provider adapter 的核心信号：OpenAI 集成不是独立体系，而是 core chat model 抽象的一个实现。

字段层面，`model_name` 默认是 `"gpt-3.5-turbo"`，`model_kwargs` 用于保存没有显式字段但仍要传给 create call 的模型参数，`openai_api_key` 可以通过 `OPENAI_API_KEY` 环境变量推断。这些字段把 provider 初始化和认证收敛到 adapter 内。

`_stream` 先确保同步 client 可用，然后设置 `kwargs["stream"] = True`，必要时加入 stream usage 选项，再通过 `_get_request_payload` 生成请求。它会遍历 provider 返回的 chunk，把 chunk 转成 LangChain 的 `ChatGenerationChunk`，并在有 run manager 时触发 `on_llm_new_token`。

`_generate` 是非流式生成入口。它同样先构造 payload，然后根据 `response_format`、responses API 等情况选择不同 OpenAI API 分支，最后转回 LangChain 的 `ChatResult`。

`bind_tools` 展示了 provider adapter 对 tool calling 的吸收能力。它接收 LangChain tool-like 对象，使用 `convert_to_openai_tool` 变成 OpenAI 兼容 schema，再处理 `tool_choice`、`strict`、`parallel_tool_calls`、`response_format` 等 provider 参数。

`tool_choice == "any"` 被转换成 `"required"` 是一个很好的 adapter 例子：上层可以使用更通用的表达，OpenAI adapter 负责转成 OpenAI 实际支持的值。

`ChatOpenAI` 的 docstring 还强调它只面向官方 OpenAI API specification，不抽取第三方 provider 的非标准字段。这说明 provider adapter 不是万能兼容层，偏离官方协议时最好使用 provider-specific package。

## 设计取舍

收益：

- 上层 Agent 不需要知道 OpenAI payload 细节。
- OpenAI API 的 stream、responses API、tool_choice 差异集中在 adapter 内。
- 工具 schema 转换有统一位置。
- `BaseChatModel` 的 Runnable/callback/tracing 能力可以复用。
- provider-specific 参数通过字段和 `model_kwargs` 管理。

成本：

- provider adapter 会非常厚，承担大量兼容逻辑。
- API 演进会不断推动 adapter 变化。
- 通用抽象无法完全覆盖所有 provider 特性。
- 第三方 OpenAI-compatible API 可能有非标准字段，不能假设 ChatOpenAI 都会保留。
- tool calling 的行为不仅取决于 Tool schema，也取决于 provider 对 schema 的支持程度。

## 和 Java 后端经验类比

可以把 Provider Integration 类比成支付渠道 adapter：

- `BaseChatModel` 像统一支付接口。
- `ChatOpenAI` 像支付宝/Stripe 的具体实现。
- `_generate` 像普通扣款 API。
- `_stream` 像事件流或异步回调。
- `bind_tools` 像把内部订单 schema 转成渠道要求的 request schema。
- `tool_choice` 兼容逻辑像渠道枚举值映射。

差异是模型 provider 的输出包含自然语言、结构化调用、token 统计、stream chunk，协议变化更频繁。

## 容易误解的点

- 误解 1：`ChatOpenAI` 是 Agent。实际它只是模型 provider adapter。
- 误解 2：OpenAI-compatible API 都能完整用 `ChatOpenAI`。非标准字段可能不会被保留。
- 误解 3：tool schema 一旦定义，所有 provider 行为一致。实际 provider 支持和限制不同。
- 误解 4：`bind_tools` 只是把 tools 保存起来。实际它会转换成 OpenAI tool schema 并处理 `tool_choice`。
- 误解 5：provider adapter 是薄封装。实际它承担认证、payload、streaming、错误、兼容和 schema 转换。

## 自测题

见 `../quizzes/08-provider-integration.quiz.md`。

## 掌握度验证

见 `../mastery/08-provider-integration.mastery.md`。

## 最小复刻任务

见 `../labs/08-mini-provider-adapter/README.md`。

## 学完标准

你应该能不看笔记解释：

- Provider Integration 和 ChatModel Adapter 的关系。
- `BaseChatOpenAI` 为什么继承 `BaseChatModel`。
- `_generate` 和 `_stream` 各自处理什么。
- `bind_tools` 如何把 LangChain tools 转成 OpenAI tools。
- adapter 如何吸收 provider API 差异，保护上层 Agent。

