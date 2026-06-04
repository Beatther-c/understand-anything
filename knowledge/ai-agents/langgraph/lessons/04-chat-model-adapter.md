# 04 模型适配：把 ChatModel 当成图节点的一部分

## 你会学到什么

- `create_react_agent` 如何接受 `LanguageModelLike` 参数并自动绑定工具。
- `_should_bind_tools` 的检测逻辑：判断模型是否已经绑定了工具。
- `prompt | model` chain 如何组成 agent 节点的执行管道。
- `LanguageModelLike` 协议的"鸭子类型"设计——任何实现 `invoke(messages)` 的对象都能用。
- 类比 Java 中的 Adapter Pattern：将第三方 SDK 的 ChatModel 适配为框架内的节点。

## AI 概念从零解释

在 Agent 系统中，ChatModel（如 GPT-4、Claude）不是独立工作的——它需要被"嵌入"到图的执行流中。问题是：不同 LLM 提供商的 API 格式不同（OpenAI 的 function calling、Anthropic 的 tool use），如何统一？

LangGraph 的策略是**适配器模式**：

1. **LanguageModelLike**：LangChain Core 定义的协议类型，只要对象有 `invoke(messages) -> BaseMessage` 方法就满足。类似 Go 的 interface——不需要显式 implement，有方法就行。
2. **bind_tools**：模型实例调用 `.bind_tools(tools)` 后，返回一个 `RunnableBinding`——原模型加上工具定义。这和 Java 中"装饰器"或"代理"模式一样：不修改原对象，包装后增加能力。
3. **agent 节点 = prompt | model**：在 `create_react_agent` 中，agent 节点的执行逻辑是 `prompt_runnable | model`（RunnableSequence），先组装消息列表，再调用模型。

这种设计让你可以用**任何 LLM**（包括自部署的开源模型），只要它遵循 `LanguageModelLike` 协议。类比 Java JDBC 驱动适配器——不同数据库的驱动不同，但对上层暴露统一的 `Connection.execute()` 接口。

## 源码阅读路径

| 属性 | 值 |
|------|------|
| repo | langchain-ai/langgraph |
| commit | `83dd61feaca993d2ee428706ad04c869895ce400` |
| scope | `libs/prebuilt/langgraph/prebuilt/` |
| primary path | `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py` |
| primary symbol | `create_react_agent` |

**3 步阅读法**：
1. 从 `_should_bind_tools`（L173-217）开始，理解框架如何判断模型是否需要自动绑定工具。
2. 阅读 `create_react_agent`（L278-500）的参数定义和函数签名，重点看 `model` 参数的类型联合体（支持 str、LanguageModelLike、动态 Callable）。
3. 追踪函数内部如何构建 `StateGraph`、注册 agent 节点（model 作为核心）和 tools 节点，最后 compile 返回。

## 关键 claims 与 evidence

### claim-04-chat-model-adapter

> create_react_agent 接受 LanguageModelLike 参数，自动调用 model.bind_tools(tools) 绑定工具，并将 prompt|model 组成的 chain 作为 agent 节点

**证据支持**：

- **ev-create-react-agent-code**（`chat_agent_executor.py` L278-500）：`create_react_agent` 接受 `model: LanguageModelLike` 参数，内部构建包含 `agent` 和 `tools` 两个节点的 `StateGraph`。agent 节点的执行逻辑是 prompt + model 的 chain。
- **ev-should-bind-tools-code**（`chat_agent_executor.py` L173-198）：`_should_bind_tools` 检查模型是否为 `RunnableBinding` 且 kwargs 中包含 `tools` 键。如果未绑定则返回 True，触发自动 `model.bind_tools(tools)` 调用。还做了工具数量一致性校验。
- **ev-test-react-agent-basic**（`test_react_agent.py` L91-121）：测试 `test_no_prompt` 验证不带 prompt 时 create_react_agent 的基本 ReAct 循环执行——模型生成 tool_calls，ToolNode 执行，再回到模型。
- **ev-test-react-agent-prompt**（`test_react_agent.py` L148-168）：测试 `test_system_message_prompt` 验证 SystemMessage 作为 prompt 参数被正确注入到消息列表开头。

## 相关测试证据

- **ev-test-react-agent-basic**（`test_react_agent.py` L91-121）：使用 `FakeToolCallingModel` 模拟 LLM 返回 tool_calls，验证 agent→tools→agent 的循环直到模型不再返回 tool_calls。阅读时关注：模型的 `bind_tools` 是否被自动调用，以及循环终止条件。
- **ev-test-react-agent-prompt**（`test_react_agent.py` L148-168）：传入 `SystemMessage("You are helpful")` 作为 prompt，验证模型收到的消息列表中第一条确实是该 SystemMessage。阅读时观察 prompt 是如何被插入到 messages 前面的。

## 真实源码解释

`create_react_agent` 是 LangGraph 最重要的预构建函数——它把"ChatModel + Tools"组装成完整的 ReAct Agent 图。核心设计决策有三个：

**1. 智能工具绑定**：`_should_bind_tools` 先检查模型是否已通过 `model.bind_tools()` 绑定了工具。如果是 `RunnableBinding` 且 kwargs 有 `tools`，说明用户已手动绑定，跳过；否则自动调用 `model.bind_tools(tools)`。这避免了重复绑定，同时支持用户自定义绑定参数。

**2. prompt 多态**：`prompt` 参数支持 4 种形态——字符串（转为 SystemMessage）、SystemMessage 对象、Callable（动态生成）、Runnable。框架将其统一包装为 `prompt_runnable`，在 agent 节点执行时先 run prompt 组装消息，再 pipe 给 model。

**3. 图拓扑固定**：无论参数如何变化，生成的图结构始终是 `agent` → 条件边（有 tool_calls?） → `tools` → `agent`（循环）或 `END`。这就是经典的 ReAct 循环。`tools_condition` 函数检查最后一条 AIMessage 是否包含 tool_calls 来决定路由。

`LanguageModelLike` 的鸭子类型设计意味着：你自己实现一个类，只要有 `invoke(messages: list[BaseMessage]) -> BaseMessage` 方法，就能直接传入 `create_react_agent`，无需继承任何基类。

## 自测题

请前往 `quizzes/04-chat-model-adapter.quiz.md` 完成自测。

## 掌握度验证

请前往 `mastery/04-chat-model-adapter.mastery.md` 完成掌握度验证。

## 最小复刻任务

请前往 `labs/04-mini-chat-model-adapter/` 完成最小复刻任务。

## 学完标准

- 能解释 `_should_bind_tools` 的判断逻辑及其三种返回路径。
- 能说明 `LanguageModelLike` 协议的最小满足条件。
- 能描述 create_react_agent 生成的图拓扑（agent → tools_condition → tools/END 循环）。
- 能口述 prompt 参数的 4 种形态及各自的处理方式。
- 能解释为什么 agent 节点使用 `prompt | model` 的 pipeline 模式而非直接调用 model。
