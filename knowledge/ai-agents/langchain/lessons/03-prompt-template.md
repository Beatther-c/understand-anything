# 03 Prompt Template

## 你会学到什么

- Prompt 为什么不能长期依赖字符串拼接。
- `BasePromptTemplate` 如何声明输入变量、partial 变量、metadata 和 tags。
- `PromptTemplate.from_template` 如何从模板字符串推断变量。
- `ChatPromptTemplate` 如何把多条 message template 变成 chat model 输入。
- Prompt template 为什么也是 Runnable pipeline 的一步。

## AI 概念从零解释

Prompt 是你给模型的任务说明和上下文组织方式。最开始你可能会写：

```python
prompt = "请总结：" + article
```

但真实应用很快会变复杂：

- 有系统规则。
- 有用户输入。
- 有历史消息。
- 有少样本示例。
- 有工具说明。
- 有输出格式约束。
- 有需要复用的固定变量。

这时 prompt 不再适合手写字符串拼接。它需要像 API request 一样有 schema、有变量校验、有可组合的对象模型。

## 为什么工程上需要这个抽象

Prompt template 解决的是“模型输入构造”的工程化问题：

- 哪些变量必须传入。
- 哪些变量可以提前绑定。
- 缺变量时在哪里报错。
- prompt 生成的是普通文本还是 message list。
- prompt formatting 如何接入 tracing。
- prompt 如何和 model、parser 串成 pipeline。

在 LangChain 里，prompt template 继承 `RunnableSerializable[dict, PromptValue]`。这意味着 prompt 不是“辅助函数”，而是一个从输入 dict 到 `PromptValue` 的标准 Runnable。

## 最小心智模型

```python
class MiniPromptTemplate:
    def __init__(self, template, input_variables, partial=None):
        self.template = template
        self.input_variables = input_variables
        self.partial = partial or {}

    def invoke(self, values):
        merged = {**self.partial, **values}
        missing = set(self.input_variables) - set(merged)
        if missing:
            raise KeyError(missing)
        return self.template.format(**merged)


prompt = MiniPromptTemplate("Tell me about {topic}", ["topic"])
prompt.invoke({"topic": "Runnable"})
```

真实 LangChain 还支持 chat messages、optional variables、input types、output parser、metadata、tags 和多种模板格式。

## LangChain 源码入口

- repo: `langchain-ai/langchain`
- commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`
- base prompt: `libs/core/langchain_core/prompts/base.py:40`
- input validation: `libs/core/langchain_core/prompts/base.py:160`
- prompt invoke: `libs/core/langchain_core/prompts/base.py:207`
- string prompt: `libs/core/langchain_core/prompts/prompt.py:24`
- `from_template`: `libs/core/langchain_core/prompts/prompt.py:298`
- chat prompt: `libs/core/langchain_core/prompts/chat.py:790`
- chat input variable validation: `libs/core/langchain_core/prompts/chat.py:1049`

## 源码阅读路径

1. 先看 `BasePromptTemplate` 继承关系：`base.py:40`。
2. 看 `input_variables`、`optional_variables`、`partial_variables`：`base.py:45`、`base.py:50`、`base.py:66`。
3. 看变量名校验，尤其是不能使用内部保留的 `stop`：`base.py:79`。
4. 看 `_validate_input`：`base.py:160`，理解非 dict 输入和缺变量报错。
5. 看 `invoke`：`base.py:207`，理解 prompt 如何接入 config、metadata、tags 和 tracing。
6. 看 `PromptTemplate.from_template`：`prompt.py:298`，理解变量推断。
7. 看 `ChatPromptTemplate` 示例和 `validate_input_variables`：`chat.py:790`、`chat.py:1049`。

## 核心实体和关系

- `BasePromptTemplate`：所有 prompt 模板的基类。
- `PromptTemplate`：字符串 prompt 模板。
- `ChatPromptTemplate`：chat message prompt 模板。
- `PromptValue`：prompt format 后的值，可进一步转为 string 或 messages。
- `BasePromptTemplate -> Runnable`：prompt 可作为 pipeline 的一步。
- `PromptTemplate.from_template -> get_template_variables`：从模板中推断输入变量。

## 关键 claims 与 evidence

- `claim-prompt-template-is-runnable-step`：Prompt template 是可校验、可 partial binding、可作为 Runnable pipeline 步骤调用的对象。证据：`ev-base-prompt-template`、`ev-prompt-template-invoke`、`ev-chat-prompt-template`。
- `BasePromptTemplate` 继承 `RunnableSerializable[dict, PromptValue]`。证据：`prompts/base.py:40`。
- `_validate_input` 会检查缺失变量并提供转义提示。证据：`prompts/base.py:160` 到 `base.py:193`。
- `PromptTemplate.from_template` 会调用 `get_template_variables` 推断变量。证据：`prompts/prompt.py:298`。
- `ChatPromptTemplate` 可以把 system/human/ai message 模板格式化成 `ChatPromptValue`。证据：`prompts/chat.py:790`。

## 相关测试证据

- `ev-test-prompt-from-template`：`tests/unit_tests/prompts/test_prompt.py:21-69` 验证 `PromptTemplate` 可构造，并能从模板推断输入变量。
- `ev-test-prompt-partial-validation`：`tests/unit_tests/prompts/test_prompt.py:250-305` 验证 partial binding 会减少待输入变量，模板校验能发现缺失或错误变量。
- `ev-test-chat-prompt-formatting`：`tests/unit_tests/prompts/test_chat.py:86-107` 验证 `ChatPromptTemplate.from_template` 会产生 message prompt template，并支持 partial variables。
- `ev-test-chat-prompt-invoke`：`tests/unit_tests/prompts/test_chat.py:350-357` 验证 chat prompt invoke 后输出具体 `SystemMessage` / `HumanMessage`。

这些测试把 prompt template 的三个工程价值落实到行为：变量发现、输入校验、message 化输出。

## 真实源码解释

`BasePromptTemplate` 的字段非常工程化。`input_variables` 是调用者必须提供的变量，`optional_variables` 用于可选 placeholder，`input_types` 保存变量类型，`partial_variables` 让模板自带一部分变量。

`validate_variable_names` 禁止变量名叫 `stop`，因为 `stop` 是模型调用内部使用的参数。这个细节说明 prompt template 不只是文本替换，它和模型调用协议有边界约束。

`_validate_input` 做了两个有意思的处理：如果输入不是 dict 且模板只有一个变量，它会自动把这个值包装成 `{var_name: value}`；如果变量缺失，它会明确告诉你缺了什么，并提示如果你想让 `{foo}` 作为字面量出现，需要写成 `{{foo}}`。

`invoke` 不是直接 `format`，而是先 `ensure_config`，合并 metadata 和 tags，再通过 `_call_with_config` 调用 `_format_prompt_with_error_handling`，并把 run type 标记为 `prompt`。这就是 prompt 能进入 Runnable tracing 体系的原因。

`PromptTemplate.from_template` 通过 `get_template_variables` 从模板字符串中推断变量。如果传了 `partial_variables`，它会从 input variables 中去掉已 partial 的变量。

`ChatPromptTemplate` 的示例展示了一个关键差异：它最终输出的是 `ChatPromptValue(messages=[...])`，不是普通字符串。这让 prompt 能自然对接 chat model 的 message schema。

## 设计取舍

收益：

- prompt 输入变量可检查，缺变量早失败。
- prompt 可以作为 Runnable pipeline 的一环参与组合。
- metadata 和 tags 能进入 tracing。
- partial variables 支持复用和分层绑定。
- chat prompt 能保持 message role，而不是把角色压扁成字符串。

成本：

- prompt template 抽象层比字符串拼接厚。
- 模板格式有安全边界，尤其是 jinja2。
- 输入变量推断、partial、optional placeholder 叠加后，初学者可能不容易判断最终需要哪些变量。

## 和 Java 后端经验类比

可以把 prompt template 类比成 `PreparedStatement` 或 typed request builder：

- 模板字符串像 SQL 模板。
- `input_variables` 像必填参数。
- `_validate_input` 像参数校验。
- `partial_variables` 像提前绑定部分参数。
- `invoke` 像生成一个可追踪的 request object。

但 prompt 比 SQL 更软：变量不只是数据，也会影响模型行为；message role 和输出格式约束也属于 prompt 的一部分。

## 容易误解的点

- 误解 1：PromptTemplate 只是 `str.format` 包装。实际它是 Runnable。
- 误解 2：prompt 缺变量会到模型调用时才失败。实际在 format 阶段就会失败。
- 误解 3：ChatPromptTemplate 输出字符串。实际它输出 message prompt value。
- 误解 4：partial variable 只是语法糖。实际它改变了调用者需要提供的输入集合。
- 误解 5：prompt 工程只是写文案。实际它是模型输入协议设计。

## 自测题

见 `../quizzes/03-prompt-template.quiz.md`。

## 掌握度验证

见 `../mastery/03-prompt-template.mastery.md`。

## 最小复刻任务

见 `../labs/03-mini-prompt-template/README.md`。

## 学完标准

你应该能不看笔记解释：

- 为什么 prompt template 比字符串拼接更可靠。
- `input_variables`、`optional_variables`、`partial_variables` 的区别。
- `PromptTemplate.from_template` 如何推断变量。
- prompt 为什么能放到 `prompt | model` 的左边。
- ChatPromptTemplate 为什么必须保留 message role。

