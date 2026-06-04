# OpenClaw 全局架构：本地优先个人 AI 助手

## 你会学到什么

把 OpenClaw 先看成一个由 Gateway 调度的本地优先 agent 操作系统：消息入口、agent runtime、工具、插件、设备节点和 UI 都围绕同一个控制面工作。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：把 OpenClaw 先看成一个由 Gateway 调度的本地优先 agent 操作系统：消息入口、agent runtime、工具、插件、设备节点和 UI 都围绕同一个控制面工作。

## 为什么工程上需要这个抽象

本地优先换来更强控制权和隐私边界，但工程上必须处理权限、凭据、会话持久化、多渠道差异和长任务可靠性。

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
channel inbound -> gateway/session routing -> agent runtime -> model stream -> tool calls -> tool results -> reply delivery
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- README.md: OpenClaw 的产品定位、支持渠道、Gateway、工具、节点、沙箱安全模型。
- docs/agent-runtime-architecture.md: runtime、session、tool、provider、plugin SDK 的分层说明。
- package.json: monorepo 脚本暴露了 gateway、agent、tui、插件、移动端与测试入口。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `README.md`
2. `docs/agent-runtime-architecture.md`
3. `package.json`

## 核心 entities 与 relations

- entity：`concept:01-platform-map`
- lesson：`lesson:01-platform-map`
- claim：`claim-01-platform-map`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-01-platform-map`：把 OpenClaw 先看成一个由 Gateway 调度的本地优先 agent 操作系统：消息入口、agent runtime、工具、插件、设备节点和 UI 都围绕同一个控制面工作。
- evidence：ev-readme-product, ev-doc-runtime-layout, ev-test-agent-loop-basic, ev-test-acp-manager

## 相关测试证据

- ev-test-agent-loop-basic: agent-core 的 agent-loop 测试覆盖基础事件流和消息返回。
- ev-test-acp-manager: ACP manager 测试覆盖 session manager 的基础行为。

## 真实源码解释

这一层的源码不是单一函数，而是一组边界协作。阅读时不要急着追所有 import；先抓住入口、状态对象、外部副作用和测试覆盖，再向下展开细节。

## 设计取舍

本地优先换来更强控制权和隐私边界，但工程上必须处理权限、凭据、会话持久化、多渠道差异和长任务可靠性。

## Java/backend 类比

像一个后端平台把 HTTP、队列、定时任务和内部服务统一进一个工作流引擎；区别是工作流的决策节点由 LLM 动态产生。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/01-platform-map.quiz.md`。

## 掌握度验证

见 `mastery/01-platform-map.mastery.md`。

## 最小复刻任务

见 `labs/mini-platform-map/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

