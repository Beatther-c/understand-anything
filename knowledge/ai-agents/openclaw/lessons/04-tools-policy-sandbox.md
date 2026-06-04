# 工具系统：定义、策略、沙箱与执行前后钩子

## 你会学到什么

工具调用是 agent 产生外部影响的边界。OpenClaw 同时处理 schema 规范化、allow/deny 策略、沙箱路径、before/after hook、执行顺序和错误归一化。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：工具调用是 agent 产生外部影响的边界。OpenClaw 同时处理 schema 规范化、allow/deny 策略、沙箱路径、before/after hook、执行顺序和错误归一化。

## 为什么工程上需要这个抽象

工具越丰富，agent 越有能力；但每一种能力都必须有可审计的权限、输入校验和日志脱敏。

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
tool catalog -> policy pipeline -> model-compatible schema -> beforeToolCall -> execute -> afterToolCall -> ToolResultMessage
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- src/agents/agent-tools.ts: 工具工厂、策略流水线、沙箱/host 工具、插件工具集合。
- src/agents/agent-tool-definition-adapter.ts: 工具执行参数拆分、错误归一化、敏感日志处理。
- src/agents/embedded-agent-runner/run/attempt-tool-construction-plan.ts: allowlist 如何决定要构造哪些工具集合。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `src/agents/agent-tools.ts`
2. `src/agents/agent-tool-definition-adapter.ts`
3. `src/agents/embedded-agent-runner/run/attempt-tool-construction-plan.ts`

## 核心 entities 与 relations

- entity：`concept:04-tools-policy-sandbox`
- lesson：`lesson:04-tools-policy-sandbox`
- claim：`claim-04-tools-policy-sandbox`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-04-tools-policy-sandbox`：工具调用是 agent 产生外部影响的边界。OpenClaw 同时处理 schema 规范化、allow/deny 策略、沙箱路径、before/after hook、执行顺序和错误归一化。
- evidence：ev-code-tool-factory, ev-code-tool-adapter, ev-code-tool-construction, ev-test-tool-adapter, ev-test-tool-policy, ev-test-tool-construction

## 相关测试证据

- ev-test-tool-adapter: 工具 adapter 测试覆盖工具定义适配、执行和错误处理。
- ev-test-tool-policy: 工具 policy 测试覆盖 allow/deny、继承与工具策略行为。
- ev-test-tool-construction: 工具构造计划测试覆盖 allowlist、禁用工具和 plugin/channel/core 工具构造开关。

## 真实源码解释

`agent-tools.ts` 是工具集合的组装入口；`attempt-tool-construction-plan.ts` 先根据 allowlist 判断哪些工具族需要构造；`agent-tool-definition-adapter.ts` 把不同工具返回值、参数签名和错误统一成 agent-core 能理解的结果。这个分层让模型工具、OpenClaw 本机工具、channel 工具和插件工具可以共存。

## 设计取舍

工具越丰富，agent 越有能力；但每一种能力都必须有可审计的权限、输入校验和日志脱敏。

## Java/backend 类比

像后端的 API gateway + RBAC + request/response filter，只是调用方是模型。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/04-tools-policy-sandbox.quiz.md`。

## 掌握度验证

见 `mastery/04-tools-policy-sandbox.mastery.md`。

## 最小复刻任务

见 `labs/mini-tools-policy-sandbox/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

