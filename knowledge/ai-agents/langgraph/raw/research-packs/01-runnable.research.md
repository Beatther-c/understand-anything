# Research Pack: LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph

## Research goal

确认 `StateGraph, CompiledStateGraph` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:01-runnable`
- `concept:01-runnable`

## Source entry points

- `libs/langgraph/langgraph/graph/state.py` / `StateGraph.compile`

## Candidate claims

- StateGraph.compile 会把声明式节点/边转换为可 invoke/stream 的 CompiledStateGraph，而不是直接执行节点函数。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-state-basic`: `libs/langgraph/tests/test_state.py:1`，状态图测试覆盖基础节点、边和状态更新行为。
- `ev-test-runnable`: `libs/langgraph/tests/test_runnable.py:1`，Runnable 互操作测试证明编译图可作为可调用对象使用。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。
