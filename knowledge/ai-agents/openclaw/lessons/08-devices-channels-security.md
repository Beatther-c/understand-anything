# 渠道、设备节点与安全默认值

## 你会学到什么

OpenClaw 面对真实外部渠道和本机设备能力，所以安全模型必须默认把 inbound DM 当成不可信输入，并用 pairing、allowlist、sandbox、工具策略和节点权限收口。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：OpenClaw 面对真实外部渠道和本机设备能力，所以安全模型必须默认把 inbound DM 当成不可信输入，并用 pairing、allowlist、sandbox、工具策略和节点权限收口。

## 为什么工程上需要这个抽象

默认安全会让初次接入多一步 pairing，但避免把私人助手变成开放远程执行入口。

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
external channel/node -> gateway protocol -> identity/pairing -> allowed agent/session -> constrained tool/node action
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- README.md: DM pairing、allowlist、sandbox 默认安全说明。
- packages/gateway-protocol/src/schema.ts: Gateway 协议 schema。
- apps/android/app/src/test/java/.../node 与 gateway 测试: Android 节点能力、设备认证、通知/相机/联系人等 handler。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `README.md`
2. `packages/gateway-protocol/src/schema.ts`
3. `apps/android/app/src/test/java/.../node 与 gateway 测试`

## 核心 entities 与 relations

- entity：`concept:08-devices-channels-security`
- lesson：`lesson:08-devices-channels-security`
- claim：`claim-08-devices-channels-security`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-08-devices-channels-security`：OpenClaw 面对真实外部渠道和本机设备能力，所以安全模型必须默认把 inbound DM 当成不可信输入，并用 pairing、allowlist、sandbox、工具策略和节点权限收口。
- evidence：ev-readme-security, ev-test-android-device-auth, ev-test-gateway-protocol, ev-test-android-node-handlers

## 相关测试证据

- ev-test-android-device-auth: Android device auth 测试支持设备认证 payload 语义。
- ev-test-gateway-protocol: gateway-protocol 测试支持 Gateway 协议导出与 schema 契约。
- ev-test-android-node-handlers: Android node invoke dispatcher 测试支持节点能力调用分发。

## 真实源码解释

这一层的源码不是单一函数，而是一组边界协作。阅读时不要急着追所有 import；先抓住入口、状态对象、外部副作用和测试覆盖，再向下展开细节。

## 设计取舍

默认安全会让初次接入多一步 pairing，但避免把私人助手变成开放远程执行入口。

## Java/backend 类比

像企业后端的 zero-trust ingress：先鉴权、授权、限权，再进入业务处理。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/08-devices-channels-security.quiz.md`。

## 掌握度验证

见 `mastery/08-devices-channels-security.mastery.md`。

## 最小复刻任务

见 `labs/mini-devices-channels-security/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

