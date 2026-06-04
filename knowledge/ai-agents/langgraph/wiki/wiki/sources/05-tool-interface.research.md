# Research Pack: 工具接口：ToolNode、InjectedState 与 ToolMessage

## Research goal

确认 `ToolNode, tools_condition, InjectedState, InjectedStore` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:05-tool-interface`
- `concept:05-tool-interface`

## Source entry points

- `libs/prebuilt/langgraph/prebuilt/tool_node.py` / `ToolNode`

## Candidate claims

- ToolNode 会识别 AIMessage 中的工具调用，并把 InjectedState/InjectedStore 等系统参数从 LLM 可见 schema 中隔离出来。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-toolnode`: `libs/prebuilt/tests/test_tool_node.py:1`，ToolNode 测试覆盖工具调用输入、输出和错误处理。
- `ev-test-injected-state`: `libs/prebuilt/tests/test_tool_node.py:1315`，InjectedState/InjectedStore 测试覆盖状态与存储注入。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。

