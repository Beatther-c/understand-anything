# Message Schema

<!-- confidence: EXTRACTED -->

Message Schema 是 LangChain 用来表达 system、human、ai、tool 等对话状态的结构化模型。

## 核心节点

- [[base-message]]
- [[tool-interface]]
- [[agent-loop]]

## 核心结论

<!-- confidence: EXTRACTED -->
[[base-message]] 不只是字符串包装，它还承载 metadata、message type、tool calls 和 provider response 信息。

<!-- confidence: EXTRACTED -->
Tool result 通过 ToolMessage 的 `tool_call_id` 回填到消息历史中，是 agent loop 能继续推理的关键。

## 学习材料

- `knowledge/ai-agents/langchain/lessons/02-message-schema.md`
- `knowledge/ai-agents/langchain/mastery/02-message-schema.mastery.md`
- `knowledge/ai-agents/langchain/labs/02-message-types/README.md`

