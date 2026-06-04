# 插件 SDK 与 Provider 扩展：把生态接入运行时

## 你会学到什么

插件 SDK 是 OpenClaw 的扩展边界：插件可以注册 provider、工具、命令、会话 action、hook、UI、模型目录和安全审计能力。

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：插件 SDK 是 OpenClaw 的扩展边界：插件可以注册 provider、工具、命令、会话 action、hook、UI、模型目录和安全审计能力。

## 为什么工程上需要这个抽象

扩展性要求稳定 SDK barrel；插件不能直接依赖 src 内部，否则升级成本和安全边界都会失控。

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
plugin manifest -> definePluginEntry -> register(api) -> provider/tool/session/action hooks -> runtime consumes SDK barrels
```

## 源码入口

仓库：openclaw/openclaw

提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

- src/plugin-sdk/plugin-entry.ts: 对外导出的插件 API 类型与 definePluginEntry。
- src/plugin-sdk/provider-entry.ts: defineSingleProviderPluginEntry 注册 provider、auth、catalog。
- src/plugin-sdk/provider-tools.ts: provider 侧工具 schema 兼容处理。

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

1. `src/plugin-sdk/plugin-entry.ts`
2. `src/plugin-sdk/provider-entry.ts`
3. `src/plugin-sdk/provider-tools.ts`

## 核心 entities 与 relations

- entity：`concept:07-plugin-sdk-providers`
- lesson：`lesson:07-plugin-sdk-providers`
- claim：`claim-07-plugin-sdk-providers`
- relations：见 `graph/relations.json`

## 关键 claims 与 evidence

- `claim-07-plugin-sdk-providers`：插件 SDK 是 OpenClaw 的扩展边界：插件可以注册 provider、工具、命令、会话 action、hook、UI、模型目录和安全审计能力。
- evidence：ev-code-plugin-entry, ev-code-provider-entry, ev-code-provider-tools, ev-test-plugin-entry, ev-test-provider-entry, ev-test-provider-tools

## 相关测试证据

- ev-test-plugin-entry: 插件 package contract 测试支持插件 manifest/entry 的约束。
- ev-test-provider-entry: provider runtime 测试支持 provider 注册/运行时解析。
- ev-test-provider-tools: provider tools 测试支持 schema 兼容工具函数。

## 真实源码解释

这一层的源码不是单一函数，而是一组边界协作。阅读时不要急着追所有 import；先抓住入口、状态对象、外部副作用和测试覆盖，再向下展开细节。

## 设计取舍

扩展性要求稳定 SDK barrel；插件不能直接依赖 src 内部，否则升级成本和安全边界都会失控。

## Java/backend 类比

像 Spring Boot starter 或 VS Code extension API：通过稳定扩展点接入核心系统。

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 `quizzes/07-plugin-sdk-providers.quiz.md`。

## 掌握度验证

见 `mastery/07-plugin-sdk-providers.mastery.md`。

## 最小复刻任务

见 `labs/mini-plugin-sdk-providers/README.md`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。

