# 消息、上下文与流式事件

## 你会学到什么

LLM 应用不是一次请求一次字符串，而是一组消息、系统提示、工具定义和流式事件的组合。OpenClaw 把 partial assistant message 放入上下文并随事件更新。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：LLM 应用不是一次请求一次字符串，而是一组消息、系统提示、工具定义和流式事件的组合。OpenClaw 把 partial assistant message 放入上下文并随事件更新。

## 为什么工程上需要这个抽象

把 partial message 写入上下文能支持实时 UI 和工具 call delta，但也要求 done/error 时正确替换最终 message，避免脏状态。

## 最小心智模型

```ts
async function openclawStyleTurn(input) {
  const session = await resolveSession(input);
  const runtime = await selectRuntime(session);
  const events = runtime.runTurn(input);
  for await (const event of events) {
    await persistAndPublish(event);
  }
}
```

针对本课，可压缩成：

```text
AgentMessage[] --transformContext--> AgentMessage[] --convertToLlm--> LLM Message[] --stream--> AssistantMessage events
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- packages/agent-core/src/agent-loop.ts: streamAssistantResponse 对 start/delta/done/error 的处理。
- packages/agent-core/src/types.ts: convertToLlm、transformContext、getApiKey 等可插拔契约。
- packages/llm-core/src/index.ts 与 packages/llm-core/src/types.ts: LLM 消息和 EventStream 基础类型。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `packages/agent-core/src/agent-loop.ts`
2. `packages/agent-core/src/types.ts`
3. `packages/llm-core/src/index.ts 与 packages/llm-core/src/types.ts`

## 核心 entities 与 relations

- entity：`concept:03-message-context-stream`
- lesson：`lesson:03-message-context-stream`
- claim：`claim-03-message-context-stream`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-03-message-context-stream`：LLM 应用不是一次请求一次字符串，而是一组消息、系统提示、工具定义和流式事件的组合。OpenClaw 把 partial assistant message 放入上下文并随事件更新。
- evidence：ev-code-stream-response, ev-code-agent-types, ev-test-agent-loop-basic, ev-test-llm-validation, ev-test-acp-turn-stream

## 相关测试证据

- ev-test-agent-loop-basic: agent-core 的 agent-loop 测试覆盖基础事件流和消息返回。
- ev-test-llm-validation: llm-core validation 测试为消息/模型数据契约提供证据。
- ev-test-acp-turn-stream: ACP translator 工具流测试覆盖工具事件映射/流式输出。

## 真实源码解释

这一层的源码不是单一函数，而是一组边界协作。阅读时不要急着追所有 import；先抓住入口、状态对象、外部副作用和测试覆盖，再向下展开细节。

## 设计取舍

把 partial message 写入上下文能支持实时 UI 和工具 call delta，但也要求 done/error 时正确替换最终 message，避免脏状态。

## Java/backend 类比

像 WebSocket 响应流：先创建占位 response，再不断 patch，最后 commit。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/03-message-context-stream.quiz.md`。

## 掌握度验证

见 `mastery/03-message-context-stream.mastery.md`。

## 最小复刻任务

见 `labs/mini-message-context-stream/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

