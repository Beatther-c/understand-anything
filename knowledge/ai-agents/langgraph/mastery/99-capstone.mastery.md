# 综合项目：构建完整的可持久化 ReAct Agent — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. `create_react_agent` 综合运用了全部 8 课的核心概念：StateGraph（01）、MessagesState + add_messages reducer（02）、节点函数（03）、LanguageModelLike + bind_tools（04）、ToolNode（05）、StreamMode（06）、条件边 + interrupt（07）、Checkpoint 持久化（08）。
2. 完整的 ReAct Agent 图结构：START → agent（prompt|model）→ tools_condition → tools（ToolNode）/END，循环直到无 tool_calls。
3. 持久化使得 Agent 从"一次性函数"升级为"有状态服务"——支持中断恢复、对话记忆、时间旅行调试。
4. 从开发到生产的路径：InMemorySaver → PostgresSaver，本地执行 → RemoteGraph + SDK，`stream_mode` 选择适配不同场景。

## 代码阅读检查

- [ ] 能在 `chat_agent_executor.py` L278-1016 中追踪 `create_react_agent` 的完整实现，理解它如何组装所有组件
- [ ] 能说明 agent 节点、tools 节点、tools_condition 条件边三者如何协作形成 ReAct 循环
- [ ] 能解释 `interrupt_before`/`interrupt_after` 参数如何在 ReAct 循环中插入 human-in-the-loop 控制点
- [ ] 能追踪一次完整的 Agent 执行流：用户输入 → messages Channel → agent 推理 → tool_calls → ToolNode 执行 → ToolMessage → agent 再推理 → 最终回复
- [ ] 能说明 Checkpoint 如何在 ReAct 循环的每一步保存状态，使得中断后可以从任意步骤恢复

## 通过标准

你已掌握本课程，如果你能：
- 解释 claim-99-capstone（create_react_agent 综合运用 StateGraph/MessagesState/ToolNode/条件边/Checkpoint）并引用 `ev-create-react-agent-full-code` 和 `ev-react-agent-graph-structure`
- 引用 `ev-test-react-agent-with-checkpoint` 和 `ev-test-react-agent-interrupt` 说明持久化和中断恢复的验证方式
- 完成 `labs/99-capstone-mini-langchain-agent/` 中的综合复刻实验（整合所有组件构建完整 Agent）
