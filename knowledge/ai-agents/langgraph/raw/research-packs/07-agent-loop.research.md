# Research Pack: Agent Loop：条件边、Command、interrupt 与 ReAct 循环

## Research goal

确认 `add_conditional_edges, Command, interrupt, create_react_agent` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:07-agent-loop`
- `concept:07-agent-loop`

## Source entry points

- `libs/langgraph/langgraph/types.py` / `Command, interrupt`

## Candidate claims

- LangGraph 用条件边和 Command 表达 agent 的循环、跳转、暂停和恢复，而不是把控制流藏在 while 循环里。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-interrupt-loop`: `libs/langgraph/tests/test_pregel.py:4922`，中断循环测试验证 interrupt 在循环中的暂停与恢复。
- `ev-test-parent-command`: `libs/langgraph/tests/test_parent_command.py:1`，父图 Command 测试覆盖跨图/子图跳转和状态更新。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。
