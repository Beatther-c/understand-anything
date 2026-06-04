# Research Pack: 03 Prompt Template

## 研究目标

解释 PromptTemplate 如何把 prompt 从字符串拼接升级为可校验、可组合、可追踪的 Runnable。

## 核心实体

- `BasePromptTemplate`
- `PromptTemplate`
- `ChatPromptTemplate`
- `PromptValue`

## 源码入口

- `libs/core/langchain_core/prompts/base.py:40`
- `libs/core/langchain_core/prompts/base.py:160`
- `libs/core/langchain_core/prompts/base.py:207`
- `libs/core/langchain_core/prompts/prompt.py:24`
- `libs/core/langchain_core/prompts/prompt.py:298`
- `libs/core/langchain_core/prompts/chat.py:790`
- `libs/core/langchain_core/prompts/chat.py:1049`

## 候选 claims

- `BasePromptTemplate` 继承 `RunnableSerializable[dict, PromptValue]`。
- `_validate_input` 支持单变量非 dict 输入，并对缺变量给出明确错误。
- `PromptTemplate.from_template` 通过 `get_template_variables` 推断变量。
- `ChatPromptTemplate` 保留 message role，并输出 chat prompt value。

## 关键关系

- `PromptTemplate -> PromptValue -> ChatModel`
- `ChatPromptTemplate -> messages -> BaseChatModel`
- `BasePromptTemplate.invoke -> _call_with_config`

## 不确定问题

- 需要补充 prompt template 单元测试证据。
- 需要追踪 output parser 与 prompt template 的关系。

