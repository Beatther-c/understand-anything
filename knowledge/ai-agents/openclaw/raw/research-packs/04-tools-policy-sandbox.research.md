# Research Pack: 工具系统：定义、策略、沙箱与执行前后钩子

## Research goal

为课程 `04-tools-policy-sandbox` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:04-tools-policy-sandbox`
- `concept:04-tools-policy-sandbox`

## Source entry points

- src/agents/agent-tools.ts: 工具工厂、策略流水线、沙箱/host 工具、插件工具集合。
- src/agents/agent-tool-definition-adapter.ts: 工具执行参数拆分、错误归一化、敏感日志处理。
- src/agents/embedded-agent-runner/run/attempt-tool-construction-plan.ts: allowlist 如何决定要构造哪些工具集合。

## Candidate claims

- `claim-04-tools-policy-sandbox`: 工具调用是 agent 产生外部影响的边界。OpenClaw 同时处理 schema 规范化、allow/deny 策略、沙箱路径、before/after hook、执行顺序和错误归一化。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-tool-adapter
- ev-test-tool-policy
- ev-test-tool-construction

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

