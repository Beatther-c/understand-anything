# Research Pack: 内置 Runtime：模型选择、Provider、重试与故障转移

## Research goal

为课程 `05-embedded-runtime-provider` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:05-embedded-runtime-provider`
- `concept:05-embedded-runtime-provider`

## Source entry points

- src/agents/embedded-agent-runner/run.ts: run 入口的依赖、常量和运行时控制逻辑。
- src/agents/embedded-agent-runner/run/failover-policy.ts 与 assistant-failover.ts: 故障转移决策。
- src/agents/embedded-agent-runner/model.ts: 模型解析与 provider 规范化。

## Candidate claims

- `claim-05-embedded-runtime-provider`: OpenClaw 的内置 runner 把低层 loop 包装成可运营的运行时：选择模型、准备认证、构建 prompt 和工具、处理空回复/溢出/限流/计费错误、记录 usage，并在必要时故障转移。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-run-failover
- ev-test-run-overflow
- ev-test-model-forward

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

