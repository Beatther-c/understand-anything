# 99 综合项目：构建完整的可持久化 ReAct Agent

## 你会学到什么

- 如何将前 8 课的所有核心组件整合为一个完整的 ReAct Agent
- create_react_agent 的内部实现如何串联 StateGraph、MessagesState、ToolNode、条件边和 Checkpoint
- Agent 图的完整拓扑结构：START → agent → tools_condition → tools/END
- 持久化如何将 Agent 从"一次性函数调用"升级为"有状态服务"
- 从开发到生产的路径：InMemorySaver → PostgresSaver，本地 → RemoteGraph + SDK

## AI 概念从零解释

综合项目是学习的最终验证——你需要将零散的知识组装成一个可运行的整体。类比软件工程：

- **create_react_agent** = 一个"工厂函数"，它把所有组件按照固定的模式组装为一个完整的图。类似 Spring Boot 的 auto-configuration——你提供 model 和 tools，它替你完成所有连线。

- **ReAct 循环** = "思考→行动→观察"的迭代模式。Agent 节点推理（Reasoning），产生 tool_calls（Action），ToolNode 执行并返回结果（Observation），再次推理直到无需调用工具。这个循环由 tools_condition 条件边控制。

- **完整图结构** = START → agent 节点（组装 prompt + 调用 LLM）→ tools_condition（检查 tool_calls）→ 两条分支：有 tool_calls → tools 节点（ToolNode 并行执行）→ 循环回 agent；无 tool_calls → END。

- **组件协作矩阵**：
  - StateGraph + compile（01）：声明→编译→执行的框架
  - MessagesState + add_messages（02）：状态不丢消息
  - 节点函数（03）：agent 节点的 prompt 装配
  - LanguageModelLike + bind_tools（04）：模型适配层
  - ToolNode（05）：并行工具执行
  - StreamMode（06）：流式输出
  - 条件边 + interrupt（07）：循环控制 + human-in-the-loop
  - Checkpoint（08）：持久化状态

- **持久化的价值** = 没有 Checkpoint 的 Agent 是"无状态的 HTTP handler"——每次调用从零开始。加上 Checkpoint 后变为"有状态的 session"——支持中断恢复、多轮对话、时间旅行调试。

## 源码阅读路径

- **repo**: langchain-ai/langgraph
- **commit**: 83dd61feaca993d2ee428706ad04c869895ce400
- **scope**: libs/prebuilt/langgraph/prebuilt/
- **primary path**: `libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py`
- **primary symbol**: `create_react_agent`

**3 步阅读方法**：

1. **看 create_react_agent 函数签名**（`chat_agent_executor.py:278-350`）：理解参数——model（LanguageModelLike）、tools（工具列表）、prompt（可选提示）、checkpointer（持久化后端）、interrupt_before/interrupt_after（中断点）
2. **看图组装逻辑**（`chat_agent_executor.py:900-1016`）：理解如何 add_node("agent", ...)、add_node("tools", ToolNode(...))、add_conditional_edges("agent", tools_condition)、设置 START → agent
3. **看 tools_condition 函数**（同文件）：理解路由逻辑——最后一条 AIMessage 有 tool_calls 则路由到 "tools"，否则路由到 END

补充阅读：对照测试文件 `libs/prebuilt/tests/test_react_agent.py` 理解各种配置组合的行为；查看 `interrupt_before=["tools"]` 如何在工具执行前插入人工审批点。

## 关键 claims 与 evidence

**claim-99-capstone**：create_react_agent 综合运用 StateGraph、MessagesState、ToolNode、条件边和 Checkpoint 构建完整的可持久化 ReAct Agent。

**含义解读**：这个 claim 是整个课程的总结论——它验证了所有组件能否协同工作。`create_react_agent` 不是一个简单的封装，而是对 LangGraph 框架能力的完整展示：图声明（StateGraph）、状态管理（MessagesState + reducer）、模型适配（bind_tools）、工具执行（ToolNode）、循环控制（条件边）、中断恢复（interrupt）和持久化（Checkpoint）。理解这个函数的实现，等于理解了 LangGraph 的整体架构。

**证据支持**：
- `ev-create-react-agent-full-code`：create_react_agent 的完整实现，L278-1016
- `ev-react-agent-graph-structure`：测试验证生成的图结构包含正确的节点和边
- `ev-test-react-agent-with-checkpoint`：验证配合 checkpointer 的持久化执行
- `ev-test-react-agent-interrupt`：验证 update_state 和中断恢复能力

## 相关测试证据

- **ev-test-react-agent-with-checkpoint**（`libs/prebuilt/tests/test_react_agent.py:91-121`）：验证 create_react_agent 配合 checkpointer 执行时，状态正确持久化。阅读时关注测试如何传入 `thread_id` 配置，以及如何验证跨调用的状态连续性。

- **ev-test-react-agent-interrupt**（`libs/prebuilt/tests/test_react_agent.py:535-598`）：验证 react agent 的 update_state 和中断恢复能力。关注 `interrupt_before=["tools"]` 如何暂停执行，以及 `update_state` 如何修改图状态后继续执行。

- **ev-react-agent-graph-structure**（`libs/prebuilt/tests/test_react_agent_graph.py:1-40`）：验证 create_react_agent 生成的图拓扑是否正确——包含 agent 和 tools 节点、正确的条件边、START 连接到 agent。

## 真实源码解释

**create_react_agent 的组装流程**：函数内部首先处理 model 适配（确保 bind_tools 可用），然后创建 StateGraph(MessagesState)，注册 agent 节点（负责 prompt 组装 + LLM 调用）和 tools 节点（ToolNode 包裹工具列表），添加 START → agent 边，再添加 agent → tools_condition 条件边（路由到 "tools" 或 END），最后 tools → agent 边形成循环。compile 时传入 checkpointer 和 interrupt 配置。

**agent 节点的内部逻辑**：从 state["messages"] 取出完整消息历史，拼接 system prompt（如有），调用 model.invoke(messages)，返回 {"messages": [ai_message]}。由于 MessagesState 使用 add_messages reducer，新消息自动追加而非覆盖。

**tools_condition 的路由决策**：检查 messages[-1]（最后一条 AIMessage）是否有 tool_calls 属性。有 → 返回 "tools"（继续循环），无 → 返回 END（终止）。这是整个 ReAct 循环的"开关"。

**ToolNode 的批量执行**：从最后一条 AIMessage 提取所有 tool_calls，并行调用对应工具函数，每个工具的结果封装为 ToolMessage（包含 tool_call_id 关联）。所有 ToolMessage 一次性写入 state["messages"]。

**interrupt 的插入点**：`interrupt_before=["tools"]` 意味着每次 tools_condition 路由到 "tools" 时，执行暂停——等待外部（用户或系统）确认后才执行工具。这实现了"tool call 审批"场景。恢复时节点从头执行，interrupt() 直接返回 resume 值。

**Checkpoint 在循环中的作用**：图的每个超步（superstep）结束时自动保存 checkpoint。对于 ReAct 循环，每次 agent → tools → agent 循环都会产生新 checkpoint。这意味着你可以回到任何一轮的状态——查看那一轮的 messages、tool_calls、工具结果。

## 自测题

见 `../quizzes/99-capstone.quiz.md`。

## 掌握度验证

见 `../mastery/99-capstone.mastery.md`。

## 最小复刻任务

见 `../labs/99-capstone/README.md`。

## 学完标准

- 能完整描述 create_react_agent 如何将 8 课的核心组件组装为一个图
- 能画出 ReAct Agent 的完整图拓扑，标注每条边的路由条件
- 能解释持久化如何将 Agent 从一次性执行升级为有状态服务
- 能说明 interrupt_before/after 如何在 ReAct 循环中插入控制点
- 能追踪一次完整的用户输入→多轮工具调用→最终回复的数据流
- 完成综合复刻实验，用 80-120 行代码实现完整的 mini ReAct Agent
