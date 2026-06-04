# Tool Interface

<!-- confidence: EXTRACTED -->

Tool Interface 描述模型可调用工具的 schema、参数校验、执行入口和结果回填方式。

## 核心节点

- [[base-tool]]
- [[message-schema]]
- [[agent-loop]]

## 核心结论

<!-- confidence: EXTRACTED -->
模型并不直接调用函数；它生成结构化调用意图，框架再用 [[base-tool]] 解析、执行并把结果回填为消息。

## 学习材料

- `knowledge/ai-agents/langchain/lessons/05-tool-interface.md`
- `knowledge/ai-agents/langchain/mastery/05-tool-interface.mastery.md`
- `knowledge/ai-agents/langchain/labs/05-mini-tool-calling/README.md`

