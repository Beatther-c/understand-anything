# 会话与 ACP 控制面：把一次 turn 变成可管理任务

## 你会学到什么

agent 不是孤立函数调用，而是有 session key、runtime handle、active turn、取消、超时、后台任务进度和 backend failover 的长生命周期对象。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：agent 不是孤立函数调用，而是有 session key、runtime handle、active turn、取消、超时、后台任务进度和 backend failover 的长生命周期对象。

## 为什么工程上需要这个抽象

单 session 串行化降低并发冲突，但系统必须明确后台任务、取消和超时的语义。

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
sessionKey -> actor queue -> runtime handle -> runTurn stream -> background progress -> terminal state
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- src/acp/control-plane/manager.core.ts: AcpSessionManager 的 session resolution、handle cache、actor queue。
- src/acp/control-plane/manager.turn-runner.ts: runManagerTurn 的 backend attempt、active turn、event stream、timeout。
- src/acp/control-plane/session-actor-queue.ts: 同一 session 的串行化执行。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `src/acp/control-plane/manager.core.ts`
2. `src/acp/control-plane/manager.turn-runner.ts`
3. `src/acp/control-plane/session-actor-queue.ts`

## 核心 entities 与 relations

- entity：`concept:06-sessions-acp-control-plane`
- lesson：`lesson:06-sessions-acp-control-plane`
- claim：`claim-06-sessions-acp-control-plane`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-06-sessions-acp-control-plane`：agent 不是孤立函数调用，而是有 session key、runtime handle、active turn、取消、超时、后台任务进度和 backend failover 的长生命周期对象。
- evidence：ev-code-acp-manager, ev-code-acp-turn, ev-code-acp-stream, ev-test-acp-manager, ev-test-acp-turn-runner, ev-test-acp-runtime-cache

## 相关测试证据

- ev-test-acp-manager: ACP manager 测试覆盖 session manager 的基础行为。
- ev-test-acp-turn-runner: ACP turn 结果测试覆盖 turn 输出与终止结果。
- ev-test-acp-runtime-cache: runtime cache 测试覆盖 handle cache 生命周期。

## 真实源码解释

`AcpSessionManager` 保存 actor queue、runtime handle cache 和 active turn map。`runManagerTurn` 为一次 turn 解析 backend candidate，确保 runtime handle，设置 running 状态，组合 abort signal，消费 runtime 事件流，并在超时/失败时记录 terminal 状态或进入 failover。

## 设计取舍

单 session 串行化降低并发冲突，但系统必须明确后台任务、取消和超时的语义。

## Java/backend 类比

像 Akka actor 或 Orleans grain：每个 session 是一个 actor，消息按序处理。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/06-sessions-acp-control-plane.quiz.md`。

## 掌握度验证

见 `mastery/06-sessions-acp-control-plane.mastery.md`。

## 最小复刻任务

见 `labs/mini-sessions-acp-control-plane/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

