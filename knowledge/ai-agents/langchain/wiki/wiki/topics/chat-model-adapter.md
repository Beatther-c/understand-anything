# Chat Model Adapter

<!-- confidence: EXTRACTED -->

Chat Model Adapter 用统一接口屏蔽不同模型 provider 在消息格式、streaming、tool call 和 token usage 上的差异。

## 核心节点

- [[base-chat-model]]
- [[provider-integration]]
- [[message-schema]]

## 核心结论

<!-- confidence: EXTRACTED -->
[[base-chat-model]] 把 provider 调用统一到 `invoke`、`stream`、`batch`、`bind_tools` 等接口。

## 学习材料

- `knowledge/ai-agents/langchain/lessons/04-chat-model-adapter.md`
- `knowledge/ai-agents/langchain/mastery/04-chat-model-adapter.mastery.md`
- `knowledge/ai-agents/langchain/labs/04-mini-chat-model-adapter/README.md`

