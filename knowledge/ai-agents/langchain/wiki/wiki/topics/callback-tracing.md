# Callback Tracing

<!-- confidence: EXTRACTED -->

Callback / Tracing 让 LangChain 能记录 chain、model、tool 等运行生命周期，而不是只看到最终输出。

## 核心节点

- [[callback-manager]]
- [[runnable-config]]
- [[runnable-abstraction]]

## 核心结论

<!-- confidence: EXTRACTED -->
[[callback-manager]] 提供 `on_llm_start`、`on_chat_model_start`、`on_chain_start` 等事件入口。

## 学习材料

- `knowledge/ai-agents/langchain/lessons/06-callback-tracing.md`
- `knowledge/ai-agents/langchain/mastery/06-callback-tracing.mastery.md`
- `knowledge/ai-agents/langchain/labs/06-mini-callback-tracer/README.md`

