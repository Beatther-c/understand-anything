# Research Pack: 消息、上下文与流式事件

## Research goal

为课程 `03-message-context-stream` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:03-message-context-stream`
- `concept:03-message-context-stream`

## Source entry points

- packages/agent-core/src/agent-loop.ts: streamAssistantResponse 对 start/delta/done/error 的处理。
- packages/agent-core/src/types.ts: convertToLlm、transformContext、getApiKey 等可插拔契约。
- packages/llm-core/src/index.ts 与 packages/llm-core/src/types.ts: LLM 消息和 EventStream 基础类型。

## Candidate claims

- `claim-03-message-context-stream`: LLM 应用不是一次请求一次字符串，而是一组消息、系统提示、工具定义和流式事件的组合。OpenClaw 把 partial assistant message 放入上下文并随事件更新。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-agent-loop-basic
- ev-test-llm-validation
- ev-test-acp-turn-stream

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

