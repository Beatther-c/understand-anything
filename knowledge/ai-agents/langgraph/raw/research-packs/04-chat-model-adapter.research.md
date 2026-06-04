# Research Pack: 模型适配：把 ChatModel 当成图节点的一部分

## Research goal

确认 `call_model, model.bind_tools, dynamic model` 在 LangGraph commit `83dd61feaca993d2ee428706ad04c869895ce400` 中的源码职责、测试覆盖和课程 claim。

## Core entities

- `lesson:04-chat-model-adapter`
- `concept:04-chat-model-adapter`

## Source entry points

- `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py` / `create_react_agent`

## Candidate claims

- 预构建 ReAct agent 会把模型调用封装成图节点，并校验模型绑定工具与传入工具集合的一致性。

## Key relations

- 与前后课程的依赖关系见 `graph/relations.json`。

## Test evidence candidates

- `ev-test-dynamic-model`: `libs/prebuilt/tests/test_react_agent.py:1565`，动态模型测试覆盖运行时选择模型和静态/动态模型差异。
- `ev-test-model-tool-mismatch`: `libs/prebuilt/tests/test_react_agent.py:329`，测试验证模型已绑定工具与传入工具不一致时会报错。

## Open questions

- 具体运行时性能和远程服务行为没有在本包内完整压测；课程侧重源码阅读和工程设计理解。
