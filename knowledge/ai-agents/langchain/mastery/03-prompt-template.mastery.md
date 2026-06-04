# 03 Prompt Template Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释 PromptTemplate 为什么是工程对象，而不是字符串工具函数。

完成标准：

- 说到变量校验。
- 说到 Runnable。
- 说到 ChatPromptTemplate 保留 message role。

## Level 2: 源码定位

定位并记录文件和行号：

- `BasePromptTemplate`
- `input_variables`
- `partial_variables`
- `_validate_input`
- `invoke`
- `PromptTemplate.from_template`
- `ChatPromptTemplate`
- `validate_input_variables`

## Level 3: 调用链追踪

追踪：

```python
prompt = PromptTemplate.from_template("Tell me about {topic}")
prompt.invoke({"topic": "Runnable"})
```

要求说明：

1. 变量如何被推断。
2. 输入如何被校验。
3. `invoke` 如何进入 `_call_with_config`。

## Level 4: 图谱重建

画出：

```text
PromptTemplate -> PromptValue -> ChatModel
ChatPromptTemplate -> ChatPromptValue(messages) -> ChatModel
```

## Level 5: 故障诊断

给出排查步骤：

- prompt 缺变量。
- 想输出 `{foo}` 字面量却被当成变量。
- ChatPromptTemplate message role 顺序错误。

## Level 6: 微改造

在 `labs/03-mini-prompt-template` 中增加：

- `partial(**kwargs)`
- 单变量非 dict 输入支持
- 缺变量错误提示
- chat message template

说明你的实现与 LangChain 的差距。

