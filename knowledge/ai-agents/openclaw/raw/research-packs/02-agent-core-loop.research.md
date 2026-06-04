# Research Pack: Agent Core：从消息到工具调用的最小循环

## Research goal

为课程 `02-agent-core-loop` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:02-agent-core-loop`
- `concept:02-agent-core-loop`

## Source entry points

- packages/agent-core/src/agent-loop.ts: agentLoop/runAgentLoop/runLoop/streamAssistantResponse/executeToolCalls。
- packages/agent-core/src/types.ts: AgentLoopConfig、hook、toolExecution、steering/follow-up 的契约。
- packages/agent-core/src/agent-loop.test.ts: 基础循环、工具、事件顺序的测试。

## Candidate claims

- `claim-02-agent-core-loop`: agent loop 的本质是一个事件驱动的状态机：追加用户消息，调用模型流，提取工具调用，执行工具，把工具结果写回上下文，再决定是否继续。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-agent-loop-basic
- ev-test-agent-loop-tool

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

