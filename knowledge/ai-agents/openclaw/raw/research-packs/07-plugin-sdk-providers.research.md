# Research Pack: 插件 SDK 与 Provider 扩展：把生态接入运行时

## Research goal

为课程 `07-plugin-sdk-providers` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:07-plugin-sdk-providers`
- `concept:07-plugin-sdk-providers`

## Source entry points

- src/plugin-sdk/plugin-entry.ts: 对外导出的插件 API 类型与 definePluginEntry。
- src/plugin-sdk/provider-entry.ts: defineSingleProviderPluginEntry 注册 provider、auth、catalog。
- src/plugin-sdk/provider-tools.ts: provider 侧工具 schema 兼容处理。

## Candidate claims

- `claim-07-plugin-sdk-providers`: 插件 SDK 是 OpenClaw 的扩展边界：插件可以注册 provider、工具、命令、会话 action、hook、UI、模型目录和安全审计能力。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-plugin-entry
- ev-test-provider-entry
- ev-test-provider-tools

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

