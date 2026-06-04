# Lab 03: Mini Prompt Template

目标：实现一个最小 prompt template，验证变量推断、输入校验、partial binding 和 Runnable 化调用。

## 必做功能

- `MiniPromptTemplate.from_template(template, partial_variables=None)`
- 自动从 `{name}` 推断 `input_variables`。
- `invoke(input)` 返回 formatted string。
- 单变量模板允许直接传非 dict 输入。
- 缺变量时报清晰错误。
- 支持 `partial(**kwargs)` 返回新模板。

## 验收用例

```python
prompt = MiniPromptTemplate.from_template("Tell me about {topic}")
assert prompt.input_variables == ["topic"]
assert prompt.invoke({"topic": "Runnable"}) == "Tell me about Runnable"
assert prompt.invoke("Agent") == "Tell me about Agent"

prompt2 = MiniPromptTemplate.from_template(
    "You are {role}. Answer {question}",
).partial(role="teacher")
assert prompt2.input_variables == ["question"]
assert prompt2.invoke({"question": "What is tool calling?"})
```

## 加分功能

- 支持 `{{literal}}` 转义。
- 支持 `ChatPromptTemplate([("system", "..."), ("human", "...")])`。
- 输出 `PromptValue`，提供 `to_string()` 和 `to_messages()`。
- 支持 `metadata` 和 `tags`。

## 复盘问题

1. 变量推断应该发生在构造期还是调用期？
2. partial variable 是否允许被调用入参覆盖？
3. ChatPromptTemplate 为什么不能简单拼成一个字符串？

