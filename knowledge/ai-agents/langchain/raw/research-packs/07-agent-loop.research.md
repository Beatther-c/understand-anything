# Research Pack: 07 Agent Loop

## 研究目标

解释 LangChain agent loop 如何围绕 action、observation、finish 建模，并理解 v1 `create_agent` 为什么返回 compiled graph。

## 核心实体

- `AgentAction`
- `AgentActionMessageLog`
- `AgentStep`
- `AgentFinish`
- `create_agent`

## 源码入口

- `libs/core/langchain_core/agents.py:15`
- `libs/core/langchain_core/agents.py:44`
- `libs/core/langchain_core/agents.py:105`
- `libs/core/langchain_core/agents.py:131`
- `libs/core/langchain_core/agents.py:146`
- `libs/core/langchain_core/agents.py:209`
- `libs/langchain_v1/langchain/agents/factory.py:696`
- `libs/langchain_v1/langchain/agents/factory.py:1670`
- `libs/langchain_v1/tests/unit_tests/agents/test_injected_runtime_create_agent.py:36`
- `libs/langchain_v1/tests/unit_tests/agents/middleware/core/test_tools.py:101`

## 候选 claims

- agent 基本循环是 LLM 请求 action、执行工具、返回 observation、达到停止条件后返回最终值。
- `AgentAction` 表示工具调用请求。
- `AgentStep` 将 action 和 observation 配对。
- `AgentFinish` 表示最终返回。
- v1 `create_agent` 创建 compiled graph，而不是普通 while loop。
- `create_agent` compiled graph 的真实测试路径覆盖 model tool call、tools node 执行、`ToolMessage` 回填和 runtime 注入。

## 关键关系

- `AIMessage.tool_calls -> AgentAction`
- `AgentAction -> BaseTool`
- `BaseTool result -> AgentStep / ToolMessage`
- `create_agent -> graph.compile`
- `AIMessage.tool_calls -> tools node -> ToolMessage`
- `middleware -> tools node`

## 已补充追踪

- `raw/source-notes/agent-loop-compiled-graph-trace.md` 记录了一次基于仓库 unit test 的 compiled graph 执行追踪。
- 强证据来自 `test_tool_runtime_basic_injection`：输入 `HumanMessage` 后，模型产出 `runtime_tool` 的 tool call，tools node 执行工具并生成带 `tool_call_id` 的 `ToolMessage`，随后回到模型并停止。
- 另一个证据来自 middleware tools 测试：middleware 能改写 tools node 的可用工具集合，graph 执行后只产生目标工具对应的 `ToolMessage`。

## 仍可后续研究

- LangGraph 本身的状态图、checkpoint、interrupt 和 streaming 可以作为第二阶段专门学习包。
