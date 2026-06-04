# 消息、上下文与流式事件 掌握度验证

## 口头讲解

请在 5 分钟内讲清：

- 这个抽象在 OpenClaw 中为什么存在。
- 它和上一层/下一层的边界是什么。
- 它的失败模式是什么。

## 源码定位

不看课程正文，直接在仓库中定位：

- `packages/agent-core/src/agent-loop.ts`
- `packages/agent-core/src/types.ts`
- `packages/llm-core/src/index.ts 与 packages/llm-core/src/types.ts`

## 通过标准

- 能解释 `AgentMessage[] --transformContext--> AgentMessage[] --convertToLlm--> LLM Message[] --stream--> AssistantMessage events`。
- 能把至少两个 test evidence 讲成行为契约，而不是只念文件名。
- 能指出一个可能的重构风险。

