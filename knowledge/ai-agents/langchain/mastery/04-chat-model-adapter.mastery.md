# 04 ChatModel Adapter Mastery

## Level 1: 复述

不用看 lesson，用 150-250 字解释 ChatModel Adapter 为什么能保护上层 Agent 不被 provider API 污染。

完成标准：

- 说到 provider 差异。
- 说到标准 `AIMessage`。
- 说到 `_generate` / `_stream`。

## Level 2: 源码定位

定位并记录文件和行号：

- `BaseChatModel`
- imperative methods 表
- `invoke`
- `stream`
- `_generate`
- `_stream`
- `bind_tools`

## Level 3: 调用链追踪

追踪：

```python
model.invoke([HumanMessage(content="hi")])
```

要求说明：

1. input 如何转换。
2. `generate_prompt` 处在什么层。
3. 为什么最终返回 `AIMessage`。

## Level 4: Streaming 判断

解释两种情况：

- provider 没有实现 streaming，`stream` 怎么办。
- provider 实现了 `_stream`，callbacks 如何看到 chunk。

## Level 5: 故障诊断

给出排查步骤：

- `stream` 没有逐 chunk 输出。
- model 绑定 tools 后 provider 报 schema 错误。
- token usage 没有进入标准字段。

## Level 6: 微改造

在 `labs/04-mini-chat-model-adapter` 中增加：

- mock provider
- `_generate`
- `_stream`
- `bind_tools`
- callback hook

要求测试不调用真实 provider。

