# Research Pack: 持久化与远程集成：Checkpoint、Store、SDK 与部署边界

## Research goal

确认 `BaseCheckpointSaver, InMemorySaver, client.stream` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:08-provider-integration`
- `concept:08-provider-integration`

## Source entry points

- `libs/checkpoint/langgraph/checkpoint/base/__init__.py` / `BaseCheckpointSaver`

## Candidate claims

- LangGraph 把本地运行时的 checkpoint/store 契约与远程 SDK 契约分离，使同一图可以本地执行或通过服务端线程/运行接口执行。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-checkpoint`: `libs/langgraph/tests/test_pregel.py:805`，Pregel checkpoint 测试覆盖保存、错误、pending writes 和多线程隔离。
- `ev-test-sdk-stream`: `libs/sdk-py/tests/streaming/test_thread_stream.py:1`，SDK streaming 测试覆盖线程流订阅和远程事件投影。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。

