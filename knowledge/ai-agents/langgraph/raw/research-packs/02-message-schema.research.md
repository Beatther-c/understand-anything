# Research Pack: 状态与消息：TypedDict、Reducer 与 MessagesState

## Research goal

确认 `MessagesState, add_messages, Overwrite` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:02-message-schema`
- `concept:02-message-schema`

## Source entry points

- `libs/langgraph/langgraph/graph/message.py` / `MessagesState`

## Candidate claims

- MessagesState 通过预定义 messages 字段和 add_messages reducer 支撑对话状态的增量合并。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-messages-state`: `libs/langgraph/tests/test_messages_state.py:1`，消息状态测试覆盖 TypedDict/Pydantic 状态和消息合并。
- `ev-test-channels-overwrite`: `libs/langgraph/tests/test_channels.py:497`，Overwrite 测试验证 reducer 可被显式覆盖且保持 dict 形状。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。
