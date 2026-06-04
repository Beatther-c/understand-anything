# 03 Prompt Template Quiz

## 概念题

1. Prompt template 解决了字符串拼接的哪些工程问题？
2. `input_variables`、`optional_variables`、`partial_variables` 有什么区别？
3. 为什么 PromptTemplate 可以作为 Runnable pipeline 的一步？
4. ChatPromptTemplate 和 PromptTemplate 的输出有什么根本差异？
5. 为什么 prompt 变量名不能随便使用内部保留词，例如 `stop`？

## 源码题

1. 找到 `BasePromptTemplate` 的继承关系，说明它为什么能 `invoke`。
2. 找到 `_validate_input`，说明单变量 prompt 传入非 dict 时会发生什么。
3. 找到缺变量时的错误提示，解释为什么它会提醒你用双大括号转义。
4. 找到 `PromptTemplate.from_template`，说明 `get_template_variables` 的作用。
5. 找到 `ChatPromptTemplate.validate_input_variables`，说明它如何从 messages 中推断变量。

## 设计题

1. 如果你实现一个 Java PromptTemplate，会在构造时解析变量，还是在 invoke 时解析变量？
2. partial variables 应该允许覆盖吗？如果允许，会带来什么风险？
3. PromptTemplate 应该只输出 string，还是应该抽象出 PromptValue？为什么？

## 故障诊断题

1. 模板里想出现字面量 `{name}`，却被当成变量。你如何修复？
2. `prompt | model` 运行时报缺变量，应该优先检查哪些地方？
3. ChatPromptTemplate 输出和模型期望不匹配，你会检查 message roles 还是字符串内容？为什么？

## 迁移题

1. 把一个后端接口参数校验经验迁移到 prompt template 设计上，你会保留哪些机制？
2. 设计一个可以复用 system prompt、动态用户输入、历史消息的最小 ChatPromptTemplate。

