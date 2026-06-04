# Research Pack: 会话与 ACP 控制面：把一次 turn 变成可管理任务

## Research goal

为课程 `06-sessions-acp-control-plane` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:06-sessions-acp-control-plane`
- `concept:06-sessions-acp-control-plane`

## Source entry points

- src/acp/control-plane/manager.core.ts: AcpSessionManager 的 session resolution、handle cache、actor queue。
- src/acp/control-plane/manager.turn-runner.ts: runManagerTurn 的 backend attempt、active turn、event stream、timeout。
- src/acp/control-plane/session-actor-queue.ts: 同一 session 的串行化执行。

## Candidate claims

- `claim-06-sessions-acp-control-plane`: agent 不是孤立函数调用，而是有 session key、runtime handle、active turn、取消、超时、后台任务进度和 backend failover 的长生命周期对象。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-acp-manager
- ev-test-acp-turn-runner
- ev-test-acp-runtime-cache

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

