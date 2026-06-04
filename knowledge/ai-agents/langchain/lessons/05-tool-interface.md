# 05 Tool Interface

## 你会学到什么

- tool calling / function calling 的真实工程含义。
- `BaseTool` 如何定义 `name`、`description`、`args_schema`、`response_format`。
- 为什么 Tool 也是 Runnable。
- `tool_call_schema` 如何把程序函数暴露为模型可理解的 schema。
- `AIMessage.tool_calls -> BaseTool.invoke -> BaseTool.run -> ToolMessage` 的闭环。

## AI 概念从零解释

模型并不会真的直接执行你的 Python 函数。所谓 tool calling，本质是模型输出一个结构化意图：

```json
{
  "name": "search_code",
  "arguments": {
    "query": "RunnableSequence"
  }
}
```

框架读取这个意图，找到对应工具，校验参数，执行真实函数，再把结果作为消息回填给模型。模型下一轮看到工具结果后，才能继续推理或给出最终回答。

所以 Tool Interface 不是“给人点的按钮”，而是“给模型选择动作的能力描述 + 给程序执行的 handler”。

## 为什么工程上需要这个抽象

一个可靠工具系统至少要解决：

- 模型如何知道有什么工具。
- 模型如何知道每个工具何时使用。
- 模型如何知道参数 schema。
- 框架如何校验模型给的参数。
- 工具如何执行。
- 工具出错如何处理。
- 工具结果如何回填给模型。
- tracing 如何记录工具生命周期。

LangChain 的 `BaseTool` 把这些问题收敛到一个统一抽象里。

## 最小心智模型

```python
class MiniTool:
    name = "search_code"
    description = "Search source code by keyword."
    args_schema = {"query": "string"}

    @property
    def tool_call_schema(self):
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.args_schema,
        }

    def invoke(self, tool_call):
        args = validate(tool_call["arguments"], self.args_schema)
        return self.run(**args)

    def run(self, query):
        return search(query)
```

真实 LangChain 还要处理 Pydantic schema、JSON schema、injected args、callback manager、tool errors、validation errors、artifact 等。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- base tool: `libs/core/langchain_core/tools/base.py:405`
- `name` / `description`: `base.py:446`、`base.py:449`
- `args_schema`: `base.py:455`
- `response_format`: `base.py:507`
- `tool_call_schema`: `base.py:587`
- `invoke`: `base.py:635`
- `run`: `base.py:878`
- structured tool: `libs/core/langchain_core/tools/structured.py:40`
- `StructuredTool.from_function`: `structured.py:203`

## 源码阅读路径

1. 先看 `BaseTool` 继承关系：`base.py:405`，确认 Tool 是 `RunnableSerializable`。
2. 看 `name` 和 `description`：`base.py:446`、`base.py:449`。
3. 看 `args_schema` 支持 Pydantic model 或 JSON schema：`base.py:455`。
4. 看 `response_format`：`base.py:507`，理解 content 和 artifact 的差异。
5. 看 `tool_call_schema`：`base.py:587`，理解为什么要排除 injected args。
6. 看 `invoke`：`base.py:635`，理解 Runnable 输入如何进入 tool run。
7. 看 `run`：`base.py:878`，理解 callback manager 如何包住工具执行。
8. 看 `StructuredTool.from_function`：`structured.py:203`，理解函数如何变成带 schema 的工具。

## 核心实体和关系

- `BaseTool`：所有工具的抽象基类。
- `StructuredTool`：可以从函数推断 schema 的工具实现。
- `ToolCall`：模型输出的工具调用意图。
- `ToolMessage`：工具执行后的结果消息。
- `args_schema`：参数校验和工具 schema 的来源。
- `tool_call_schema`：暴露给模型的工具调用 schema。
- `BaseTool.invoke -> BaseTool.run`：Runnable 调用进入真实工具执行。

## 关键 claims 与 evidence

- `claim-tool-interface-separates-intent-and-execution`：LangChain 的工具接口把模型生成的调用意图、参数 schema、函数执行和结果回填分开处理。证据：`ev-base-tool`、`ev-base-tool-invoke`、`ev-base-tool-run`、`ev-tool-message-tool-call-id`。
- `BaseTool` 继承 `RunnableSerializable[str | dict | ToolCall, Any]`。证据：`tools/base.py:405`。
- `description` 明确用于告诉模型 how/when/why 使用工具。证据：`tools/base.py:449`。
- `args_schema` 支持 Pydantic model 或 JSON schema。证据：`tools/base.py:455` 到 `base.py:465`。
- `tool_call_schema` 会排除 injected arguments，只暴露模型应该生成的字段。证据：`tools/base.py:587` 到 `base.py:609`。
- `run` 会配置 callback manager 并触发 `on_tool_start`。证据：`tools/base.py:916` 到 `base.py:949`。

## 相关测试证据

- `ev-test-tool-structured-args`：`tests/unit_tests/test_tools.py:148-158` 验证结构化工具可以接收 dict 参数并执行。
- `ev-test-structured-tool-schema`：`tests/unit_tests/test_tools.py:478-485` 验证 `StructuredTool.from_function` 能从函数签名推断参数 schema。
- `ev-test-tool-call-to-tool-message`：`tests/unit_tests/test_tools.py:1480-1507` 验证模型样式的 `ToolCall` 输入会返回 `ToolMessage`，并保留 `tool_call_id`。
- `ev-test-tool-schema-dict`：`tests/unit_tests/test_tools.py:2653-2673` 验证 dict 形式 `args_schema` 也可以作为 tool call schema 暴露。

这些测试覆盖了 tool calling 闭环的四段：schema 暴露、参数校验、函数执行、结果消息化。

## 真实源码解释

`BaseTool` 的 docstring 说 tools 是 agents 可以调用以执行特定动作的组件。它不是一个简单 function wrapper，而是同时包含模型可读说明、参数 schema、运行配置和 callback 生命周期的对象。

`name` 是工具唯一名称，模型会在 tool call 里引用它。`description` 的注释明确说它用于告诉模型如何、何时、为什么使用工具，甚至可以放 few-shot 示例。这意味着 description 的质量会直接影响模型是否正确选工具。

`args_schema` 可以是 Pydantic model，也可以是 JSON schema dict。这一层很关键：模型输出的参数不是可信输入，框架必须先校验再执行。

`tool_call_schema` 会根据 `args_schema` 生成给语言模型使用的 schema，并排除 injected 参数。所谓 injected 参数，是框架运行时注入的上下文，不应该让模型自己生成。

`invoke` 是 Runnable 入口，它通过 `_prep_run_args` 解析 `str | dict | ToolCall` 输入，然后调用 `run`。`run` 会配置 `CallbackManager`，构造过滤后的 input，再触发 `on_tool_start`。这说明工具执行天然接入 tracing。

`StructuredTool.from_function` 展示了常见用法：从普通函数生成工具，必要时从函数签名和 docstring 推断 schema 和 description。

## 设计取舍

收益：

- 工具定义同时服务模型选择和程序执行。
- 参数 schema 让模型输出可校验。
- Tool 继承 Runnable，能进入统一执行、callback 和 tracing 体系。
- `tool_call_schema` 隐藏 injected args，避免模型生成不该生成的字段。
- `response_format` 支持只给模型 content，同时保留 artifact 给程序使用。

成本：

- description 质量影响模型行为，这不是传统后端接口常见问题。
- Tool schema、provider tool schema、AIMessage tool_calls 三者容易混淆。
- tool error 和 validation error 处理会影响 Agent loop 是否继续。
- Tool 是 Runnable，但它的输入类型比普通 Runnable 更复杂。

## 和 Java 后端经验类比

可以把 Tool 类比成：

- `Command`：模型产生调用意图。
- `DTO schema`：`args_schema` 校验参数。
- `Handler`：`run` 执行业务逻辑。
- `OpenAPI schema`：`tool_call_schema` 告诉外部调用者怎么传参。
- `Interceptor`：callback manager 观测执行过程。

差异在于，这个“外部调用者”不是人或另一个服务，而是一个会根据自然语言 description 做选择的模型。

## 容易误解的点

- 误解 1：Tool 就是函数。实际它是函数 + schema + description + tracing + error policy。
- 误解 2：模型直接执行工具。实际模型只输出调用意图。
- 误解 3：description 是给开发者看的注释。实际它是模型选择工具的重要输入。
- 误解 4：args_schema 只是文档。实际它参与参数校验和 provider schema 转换。
- 误解 5：工具结果直接返回给用户。Agent 场景下通常要先回填给模型，再由模型决定下一步。

## 自测题

见 `../quizzes/05-tool-interface.quiz.md`。

## 掌握度验证

见 `../mastery/05-tool-interface.mastery.md`。

## 最小复刻任务

见 `../labs/05-mini-tool-calling/README.md`。

## 学完标准

你应该能不看笔记解释：

- tool calling 为什么是“模型意图 + 框架执行”。
- `name`、`description`、`args_schema` 分别影响什么。
- `tool_call_schema` 为什么要排除 injected args。
- `BaseTool.invoke` 和 `BaseTool.run` 如何衔接。
- 工具结果如何通过 `ToolMessage` 回到 Agent loop。

