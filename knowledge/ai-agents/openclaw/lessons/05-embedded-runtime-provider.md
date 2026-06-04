# 内置 Runtime：模型选择、Provider、重试与故障转移

## 你会学到什么

OpenClaw 的内置 runner 把低层 loop 包装成可运营的运行时：选择模型、准备认证、构建 prompt 和工具、处理空回复/溢出/限流/计费错误、记录 usage，并在必要时故障转移。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：OpenClaw 的内置 runner 把低层 loop 包装成可运营的运行时：选择模型、准备认证、构建 prompt 和工具、处理空回复/溢出/限流/计费错误、记录 usage，并在必要时故障转移。

## 为什么工程上需要这个抽象

可靠运行需要大量边界逻辑；代码复杂度上升，但用户看到的是一个更稳定的个人助手。

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
request -> runtime plan -> auth plan -> attempt backend -> provider stream -> classify failure -> retry/failover/compact/finalize
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- src/agents/embedded-agent-runner/run.ts: run 入口的依赖、常量和运行时控制逻辑。
- src/agents/embedded-agent-runner/run/failover-policy.ts 与 assistant-failover.ts: 故障转移决策。
- src/agents/embedded-agent-runner/model.ts: 模型解析与 provider 规范化。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `src/agents/embedded-agent-runner/run.ts`
2. `src/agents/embedded-agent-runner/run/failover-policy.ts 与 assistant-failover.ts`
3. `src/agents/embedded-agent-runner/model.ts`

## 核心 entities 与 relations

- entity：`concept:05-embedded-runtime-provider`
- lesson：`lesson:05-embedded-runtime-provider`
- claim：`claim-05-embedded-runtime-provider`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-05-embedded-runtime-provider`：OpenClaw 的内置 runner 把低层 loop 包装成可运营的运行时：选择模型、准备认证、构建 prompt 和工具、处理空回复/溢出/限流/计费错误、记录 usage，并在必要时故障转移。
- evidence：ev-code-embedded-run, ev-test-run-failover, ev-test-run-overflow, ev-test-model-forward

## 相关测试证据

- ev-test-run-failover: runner 故障转移测试覆盖 provider fallback 错误上下文。
- ev-test-run-overflow: runner 溢出压缩测试覆盖 context overflow 下的 compaction/retry。
- ev-test-model-forward: 模型 forward compatibility 测试覆盖新 provider/model 配置兼容。

## 真实源码解释

这一层的源码不是单一函数，而是一组边界协作。阅读时不要急着追所有 import；先抓住入口、状态对象、外部副作用和测试覆盖，再向下展开细节。

## 设计取舍

可靠运行需要大量边界逻辑；代码复杂度上升，但用户看到的是一个更稳定的个人助手。

## Java/backend 类比

像生产级 RPC client：有认证刷新、超时、重试、熔断、降级和指标。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/05-embedded-runtime-provider.quiz.md`。

## 掌握度验证

见 `mastery/05-embedded-runtime-provider.mastery.md`。

## 最小复刻任务

见 `labs/mini-embedded-runtime-provider/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

