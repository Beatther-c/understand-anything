# Research Pack: 节点函数即提示装配层：把业务上下文变成模型输入

## Research goal

确认 `Runtime, prompt, pre_model_hook` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:03-prompt-template`
- `concept:03-prompt-template`

## Source entry points

- `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py` / `create_react_agent`

## Candidate claims

- LangGraph 的 prompt 装配通常发生在节点或 pre_model_hook 中，运行时通过 state/context/store 注入所需上下文。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-react-prompt`: `libs/prebuilt/tests/test_react_agent.py:150`，ReAct agent 测试覆盖多种 prompt 输入形态。
- `ev-test-runtime-context`: `libs/langgraph/tests/test_runtime.py:1`，Runtime 测试验证节点能读取 context/store/stream_writer 等运行期对象。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。
