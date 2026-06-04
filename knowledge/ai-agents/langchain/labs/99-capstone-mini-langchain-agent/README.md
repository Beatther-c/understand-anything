# Lab 99: Capstone Mini LangChain Agent

目标：把 8 个单元合成一个最小可运行 Agent framework。它不追求功能完整，而是验证你是否真正理解 LangChain 的核心工程抽象。

## 必做模块

- `runnables.py`
  - `MiniRunnable`
  - `MiniRunnableSequence`
  - `MiniRunnableLambda`
  - `MiniRunnableConfig`
- `messages.py`
  - `SystemMessage`
  - `HumanMessage`
  - `AIMessage`
  - `ToolMessage`
- `prompts.py`
  - `MiniPromptTemplate`
  - `MiniChatPromptTemplate`
- `models.py`
  - `MiniBaseChatModel`
  - `ScriptedChatModel`
  - `MiniOpenAIAdapter`
- `tools.py`
  - `MiniTool`
  - `StructuredMiniTool`
  - `ToolRegistry`
- `callbacks.py`
  - `CallbackHandler`
  - `CallbackManager`
  - `RunManager`
- `agents.py`
  - `MiniAgent`
  - `AgentAction`
  - `AgentStep`
  - `AgentFinish`

## 必须通过的场景

1. `prompt | model` 可以调用。
2. model 返回普通 `AIMessage` 时 agent 直接结束。
3. model 返回 `tool_calls` 时 agent 执行工具并回填 `ToolMessage`。
4. 工具参数错误时 agent 把 validation error 作为 observation。
5. unknown tool 时 agent 给出可追踪错误。
6. streaming model 可以触发 token callback。
7. callback trace 可以展示 parent-child run tree。
8. provider adapter 可以把 `tool_choice="any"` 转成 `"required"`。

## 最小验收测试

```python
agent = MiniAgent(
    model=ScriptedChatModel([
        AIMessage("", tool_calls=[{"id": "call_1", "name": "search", "args": {"query": "Runnable"}}]),
        AIMessage("Runnable unifies execution."),
    ]),
    tools=[search_tool],
    callbacks=[RecordingHandler()],
)

assert agent.invoke("What is Runnable?") == "Runnable unifies execution."
assert agent.messages[-2].type == "tool"
assert agent.trace.root.children
```

## 推荐实现顺序

1. messages
2. runnables
3. prompts
4. callbacks
5. tools
6. models
7. agents
8. provider adapter

## 复盘问题

1. 哪些能力是 LangChain 核心抽象，哪些只是 provider 细节？
2. 你的 MiniAgent 哪些地方仍然不能支撑真实生产环境？
3. 如果下一步学习 LangGraph，你会把当前 while loop 的哪些部分迁移到 graph？

