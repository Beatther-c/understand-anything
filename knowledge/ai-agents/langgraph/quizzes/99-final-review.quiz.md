# LangGraph 综合复盘 — 自测题

## 选择题

### 1. LangGraph 中 StateGraph → CompiledStateGraph 的转换遵循什么设计模式？

- A. 单例模式
- B. 观察者模式
- C. Builder 模式（声明→编译→执行）
- D. 策略模式

**答案**: C

> StateGraph 采用经典 Builder 模式：add_node/add_edge 声明图拓扑，compile() 冻结为不可变的 CompiledStateGraph，然后通过 invoke/stream 执行。参见 `ev-stategraph-compile-code`。

### 2. 以下关于 Channel 类型的说法，哪一项是正确的？

- A. LastValue Channel 对多个写入值执行 reducer 聚合
- B. BinaryOperatorAggregate Channel 只保留最后写入的值
- C. Annotated[list, add_messages] 被解析为 BinaryOperatorAggregate Channel
- D. 所有字段默认使用 BinaryOperatorAggregate Channel

**答案**: C

> `Annotated[type, reducer]` 标注的字段解析为 BinaryOperatorAggregate，未标注字段使用 LastValue（最后写入者胜）。参见 `ev-get-channels-code`。

### 3. create_react_agent 生成的图中，循环终止的条件是什么？

- A. 达到固定的 5 次迭代上限
- B. tools_condition 检测到最后一条 AIMessage 没有 tool_calls
- C. 用户手动发送终止信号
- D. 所有工具都已被调用过一次

**答案**: B

> tools_condition 检查最后一条 AIMessage 是否有 tool_calls。有→路由到 "tools" 继续循环，无→路由到 END 终止。参见 `ev-test-react-agent-basic`。

### 4. interrupt() 恢复后，节点代码的执行方式是什么？

- A. 从 interrupt() 调用的下一行继续执行
- B. 节点从头重新执行（replay），interrupt() 直接返回 resume 值
- C. 跳过当前节点，执行下一个节点
- D. 从最近的 checkpoint 恢复整个图的状态

**答案**: B

> 恢复时节点从头重新执行，interrupt() 找到对应的 resume 值后直接返回。因此节点代码必须是幂等的。参见 `ev-interrupt-func-code` 和 `ev-test-interrupt-resume`。

### 5. ToolNode 与普通节点函数的本质区别是什么？

- A. ToolNode 是同步的，普通节点是异步的
- B. ToolNode 是批量 RPC dispatcher（并行执行多个工具），普通节点是单一业务逻辑
- C. ToolNode 不能访问 State
- D. ToolNode 必须返回完整 State

**答案**: B

> ToolNode 本质是"批量 RPC dispatcher"：从 AIMessage 提取 tool_calls，并行路由到对应工具，收集 ToolMessage 结果。参见 `ev-toolnode-invoke-code`。

### 6. 以下哪个组合最适合生产环境的 Agent 部署？

- A. InMemorySaver + 直接 invoke
- B. PostgresSaver + RemoteGraph + SDK
- C. 不使用 checkpointer + 本地执行
- D. InMemorySaver + RemoteGraph

**答案**: B

> 生产环境需要持久化（PostgresSaver）、远程部署（RemoteGraph 透明代理）和类型安全的 API 调用（SDK）。InMemorySaver 进程重启即丢失，不适合生产。参见 `ev-base-saver-code` 和 `ev-remote-graph-code`。

## 简答题

### 1. 请描述从用户输入到 Agent 完成回复的完整数据流，覆盖以下组件：StateGraph、MessagesState、add_messages reducer、agent 节点（prompt|model）、ToolNode、tools_condition、Channel。

> 提示：输入通过 START Channel 进入 → agent 节点组装 prompt 调用 LLM → AIMessage 写入 messages Channel（add_messages 追加）→ tools_condition 检查 → ToolNode 执行 → ToolMessage 写回 → agent 再次推理 → 无 tool_calls → END。

### 2. 请对比 `add_conditional_edges` 和 `Command(goto=...)` 两种路由方式的优缺点，并说明各自的适用场景。

> 提示：前者路由逻辑与业务逻辑分离，适合通用条件（如 tools_condition）；后者路由决策在节点内部，适合依赖计算结果的动态路由。参考 `ev-conditional-edges-code` 和 `ev-command-class-code`。

### 3. 请解释 LangGraph 的持久化分层架构：BaseCheckpointSaver（接口）→ InMemorySaver（测试实现）→ PostgresSaver（生产实现）。这种设计如何实现"开发/测试/生产环境的无缝切换"？

> 提示：面向接口编程，图代码不依赖具体 saver 实现。通过依赖注入切换。参考 `ev-base-saver-code`、`ev-inmemory-saver-code`、`ev-test-checkpoint-roundtrip`。

### 4. 请综合 StreamMode 的 7 种模式，设计一个完整的可观测性方案：哪些模式用于前端展示？哪些用于后端监控？哪些用于开发调试？为什么可以组合使用？

> 提示：messages→前端打字效果；updates+tasks→后端监控；debug→开发调试；custom→自定义进度。框架为每种模式独立输出。参考 `ev-stream-mode-def-code` 和 `ev-test-stream-messages`。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
