# Agent Core：从消息到工具调用的最小循环

## 你会学到什么

agent loop 的本质是一个事件驱动的状态机：追加用户消息，调用模型流，提取工具调用，执行工具，把工具结果写回上下文，再决定是否继续。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：agent loop 的本质是一个事件驱动的状态机：追加用户消息，调用模型流，提取工具调用，执行工具，把工具结果写回上下文，再决定是否继续。

## 为什么工程上需要这个抽象

核心包保持可复用和低层，不直接理解 OpenClaw 的 channel、插件、会话存储；这些由上层 runtime 注入。

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
messages[] + tools[] -> stream(model, llmContext) -> assistant message -> toolCall[] -> toolResult[] -> next turn
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- packages/agent-core/src/agent-loop.ts: agentLoop/runAgentLoop/runLoop/streamAssistantResponse/executeToolCalls。
- packages/agent-core/src/types.ts: AgentLoopConfig、hook、toolExecution、steering/follow-up 的契约。
- packages/agent-core/src/agent-loop.test.ts: 基础循环、工具、事件顺序的测试。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `packages/agent-core/src/agent-loop.ts`
2. `packages/agent-core/src/types.ts`
3. `packages/agent-core/src/agent-loop.test.ts`

## 核心 entities 与 relations

- entity：`concept:02-agent-core-loop`
- lesson：`lesson:02-agent-core-loop`
- claim：`claim-02-agent-core-loop`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-02-agent-core-loop`：agent loop 的本质是一个事件驱动的状态机：追加用户消息，调用模型流，提取工具调用，执行工具，把工具结果写回上下文，再决定是否继续。
- evidence：ev-code-agent-loop-entry, ev-code-run-agent-loop, ev-code-run-loop-tools, ev-test-agent-loop-basic, ev-test-agent-loop-tool

## 相关测试证据

- ev-test-agent-loop-basic: agent-core 的 agent-loop 测试覆盖基础事件流和消息返回。
- ev-test-agent-loop-tool: agent-loop 测试覆盖工具调用、工具结果和下一轮循环。

## 真实源码解释

`agentLoop` 负责创建事件流，`runAgentLoop` 负责把 prompt 写入上下文并发出开始事件，`runLoop` 是核心状态机。`runLoop` 每轮调用 `streamAssistantResponse`，拿到 assistant message 后查找 `toolCall` 内容块；如果存在工具调用，就执行工具、生成 `ToolResultMessage`、写回上下文，再决定继续还是结束。

## 设计取舍

核心包保持可复用和低层，不直接理解 OpenClaw 的 channel、插件、会话存储；这些由上层 runtime 注入。

## Java/backend 类比

类似 Spring Batch/Workflow 的 step runner，但 step 的下一个动作由模型输出决定，而不是静态 DAG。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/02-agent-core-loop.quiz.md`。

## 掌握度验证

见 `mastery/02-agent-core-loop.mastery.md`。

## 最小复刻任务

见 `labs/mini-agent-core-loop/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

