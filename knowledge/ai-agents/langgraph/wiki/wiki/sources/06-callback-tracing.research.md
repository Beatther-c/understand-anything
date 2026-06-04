# Research Pack: 流式输出、调试事件与追踪

## Research goal

确认 `stream, astream, debug events` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:06-callback-tracing`
- `concept:06-callback-tracing`

## Source entry points

- `libs/langgraph/langgraph/pregel/main.py` / `Pregel.stream`

## Candidate claims

- Pregel.stream/astream 提供多种 stream_mode，使调用方可以观察值、更新、消息、debug 和 checkpoint 事件。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-stream-events`: `libs/langgraph/tests/test_stream_events_v3.py:1`，stream events v3 测试覆盖事件结构和生命周期。
- `ev-test-debug-checkpoints`: `libs/langgraph/tests/test_pregel.py:4359`，debug retry 测试验证 checkpoint 事件与历史状态一致。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。

