# 综合项目：构建完整的可持久化 ReAct Agent — 自测题

## 选择题

### 1. create_react_agent 生成的图包含哪些核心组件？

- A. 仅包含 agent 节点和 END
- B. agent 节点、tools 节点、tools_condition 条件边和 START/END
- C. 仅包含 StateGraph 和 Checkpoint
- D. agent 节点和一条固定边

**答案**: B

> create_react_agent 创建包含 agent 节点（prompt + LLM）、tools 节点（ToolNode）、tools_condition 条件边的完整图。START → agent → condition → tools/END，tools → agent 形成循环。参见 `ev-create-react-agent-full-code`。

### 2. ReAct 循环的终止条件是什么？

- A. 执行固定次数后自动终止
- B. 最后一条 AIMessage 没有 tool_calls 字段
- C. 所有注册工具都被调用过
- D. 用户发送 stop 信号

**答案**: B

> tools_condition 检查最后一条 AIMessage 是否有 tool_calls。有 → 继续循环（路由到 tools），无 → 路由到 END 终止。参见 `ev-react-agent-graph-structure`。

### 3. 在 ReAct Agent 中，Checkpoint 的核心价值是什么？

- A. 提高 LLM 的推理速度
- B. 支持中断恢复、对话记忆和时间旅行调试
- C. 减少 API 调用次数
- D. 优化工具执行顺序

**答案**: B

> Checkpoint 在每个超步保存完整状态快照，使 Agent 从"一次性函数"升级为"有状态服务"。支持中断后恢复、跨轮对话记忆、以及回溯到任意历史状态。参见 `ev-test-react-agent-with-checkpoint`。

### 4. interrupt_before=["tools"] 的执行效果是什么？

- A. 工具执行前暂停，等待外部确认后继续
- B. 跳过所有工具调用
- C. 工具执行后暂停
- D. 永久终止图的执行

**答案**: A

> `interrupt_before=["tools"]` 在 ToolNode 执行前插入中断点，暂停执行等待外部输入。恢复时节点从头重新执行。这实现了 human-in-the-loop 的工具调用审批。参见 `ev-test-react-agent-interrupt`。

### 5. create_react_agent 综合运用了课程中的哪些核心组件？

- A. 仅 StateGraph 和 ToolNode
- B. StateGraph、MessagesState、节点函数、bind_tools、ToolNode、StreamMode、条件边、Checkpoint
- C. 仅 LLM 调用和工具执行
- D. 仅 Checkpoint 和 RemoteGraph

**答案**: B

> create_react_agent 是全部 8 课核心概念的综合运用：StateGraph（01）、MessagesState + reducer（02）、节点函数（03）、bind_tools（04）、ToolNode（05）、StreamMode（06）、条件边 + interrupt（07）、Checkpoint（08）。参见 `ev-create-react-agent-full-code`。

## 简答题

### 1. 请追踪一次完整的 ReAct Agent 执行流程：从用户输入 "北京今天天气如何？" 到最终回复，标注每个组件的参与。

> 提示：用户消息 → messages Channel（add_messages 追加）→ agent 节点（拼接 system prompt + 调用 LLM）→ AIMessage 含 tool_calls=[{name: "get_weather", args: {city: "北京"}}] → tools_condition 检测有 tool_calls → ToolNode 执行 get_weather → ToolMessage 写回 → agent 再次推理 → AIMessage 无 tool_calls → tools_condition 路由到 END。每步产生 checkpoint。

### 2. 请解释从 "开发原型" 到 "生产部署" 的完整路径，涉及哪些组件的替换？

> 提示：开发阶段用 InMemorySaver + 本地 invoke；测试阶段加入 stream_mode 观察执行；生产部署切换 PostgresSaver + LangGraph Server + RemoteGraph/SDK。图代码不变，只改注入配置。参考 `ev-base-saver-code` 和 `ev-remote-graph-code`。

### 3. 请对比"无 checkpointer"和"有 checkpointer"两种模式下 ReAct Agent 的行为差异，至少列出 3 个具体区别。

> 提示：无 checkpointer → 无状态、不支持中断恢复、无对话记忆、不支持 get_state/update_state；有 checkpointer → 有状态、支持跨调用恢复、支持多轮对话、支持时间旅行。参考 `ev-test-react-agent-with-checkpoint` 和 `ev-test-react-agent-interrupt`。
