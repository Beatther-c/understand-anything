# Agent Loop

<!-- confidence: EXTRACTED -->

Agent Loop 把一次模型输出扩展为“决策、行动、观察、继续决策或结束”的循环。

## 核心节点

- [[agent-action]]
- [[create-agent]]
- [[tool-interface]]
- [[message-schema]]

## 核心结论

<!-- confidence: INFERRED -->
LangChain 的底层 agent 数据结构围绕 action、observation 和 finish 建模；v1 的 `create_agent` 会生成 compiled graph。

## 学习材料

- `knowledge/ai-agents/langchain/lessons/07-agent-loop.md`
- `knowledge/ai-agents/langchain/mastery/07-agent-loop.mastery.md`
- `knowledge/ai-agents/langchain/labs/07-mini-agent-loop/README.md`

