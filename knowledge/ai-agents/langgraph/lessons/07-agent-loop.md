# 07 Agent Loop：条件边、Command、interrupt 与 ReAct 循环

## 你会学到什么

- add_conditional_edges 如何注册路由函数实现动态分支
- Command 原语如何统一状态更新、路由控制和中断恢复
- interrupt() 如何暂停执行并实现 human-in-the-loop
- Send 如何实现 map-reduce 动态并行调度
- ReAct 循环的完整控制流：agent → tools_condition → tools → agent

## AI 概念从零解释

Agent Loop 是 LangGraph 的核心——它把"LLM 做决策、工具做执行"的循环用图的控制流表达出来。类比分布式系统：

- **条件边（conditional edges）** = saga 编排器中的路由决策节点。saga 的每一步完成后，编排器根据结果决定下一步走 compensate 还是 continue。条件边做的是同样的事：节点完成后，路由函数检查状态决定下一个节点。路由函数可以返回单个节点名（顺序执行）或列表（并行扇出）。

- **Command** = 一个复合控制指令，类似 saga 中的"更新状态 + 发送下一步事件"原子操作。它把 `update`（修改状态）和 `goto`（路由到节点）合并为一个返回值，避免了"先更新状态、再靠条件边路由"的两步拆分。Command 还能通过 `graph=Command.PARENT` 向父图发送指令，实现子图到父图的跨层通信。

- **interrupt()** = checkpoint/replay 中的暂停点。就像一个分布式事务执行到需要人工审批时，持久化当前状态后挂起，等审批通过后从 checkpoint 恢复继续执行。interrupt 必须配合 checkpointer 使用，因为暂停后进程可能重启——没有持久化就没有恢复的基础。

- **Send** = map-reduce 的 map 阶段——在条件边中向多个节点实例发送不同输入，实现动态扇出。类似一个 scatter-gather 模式：一个路由决策产生多个并行任务，每个任务接收不同的输入参数。

- **ReAct 循环** = 最经典的 Agent 模式：LLM 生成 tool_calls → tools_condition 检查是否有调用 → 有则执行工具 → 结果回填 → LLM 再次决策。循环直到 LLM 不再调用工具（类似 while loop 的退出条件）。这是 LangGraph 中最重要的控制流模式。

## 源码阅读路径

- **repo**: langchain-ai/langgraph
- **commit**: 83dd61feaca993d2ee428706ad04c869895ce400
- **scope**: libs/langgraph/ + libs/prebuilt/
- **primary path**: `libs/langgraph/langgraph/graph/state.py`
- **primary symbol**: `StateGraph.add_conditional_edges`

**3 步阅读方法**：

1. **看 add_conditional_edges**（`state.py:969-1017`）：将路由函数包装为 `BranchSpec` 存储在 `self.branches[source]` 中。注意 `coerce_to_runnable` 的包装和重名检查逻辑
2. **看 Command 数据类**（`types.py:759-808`）：4 个字段 `graph/update/resume/goto`，`_update_as_tuples` 将 update 转为 Channel 写入格式。注意 `PARENT` 类变量的定义
3. **看 interrupt() 函数**（`types.py:811-934`）：追踪中断索引（scratchpad.interrupt_counter）、查找 resume 值、未找到则抛出 GraphInterrupt 暂停执行

补充阅读：看 `tools_condition`（`prebuilt/tool_node.py`）理解 ReAct 循环的退出条件；看 `Send` 数据类（`types.py`）理解 map-reduce 的 API；看 `BranchSpec`（`graph/_branch.py`）理解条件边的编译时绑定。

## 关键 claims 与 evidence

### claim-07-agent-loop-conditional

**claim**：add_conditional_edges 注册路由函数，节点完成后调用该函数决定下一步；节点也可直接返回 Command(goto=...) 实现动态路由而无需显式条件边。

**含义解读**：LangGraph 提供了两种路由方式。传统方式是 `add_conditional_edges(source, router_fn)`——router_fn 接收当前状态，返回目标节点名。这种方式适合路由逻辑与业务逻辑分离的场景，例如 `tools_condition` 只检查消息中有没有 tool_calls。

新方式是节点直接返回 `Command(goto="next_node")`，这让路由逻辑和业务逻辑在同一个函数中，减少了图定义的复杂度。这种方式适合路由决策依赖节点内部计算结果的场景——例如根据 LLM 输出动态选择下一步。

两种方式可以共存：同一个图中有些边用 `add_conditional_edges`，有些节点返回 Command。

**证据支持**：
- `ev-conditional-edges-code`：`add_conditional_edges` 实现，path 函数被包装为 BranchSpec
- `ev-command-class-code`：Command 数据类定义，goto 字段支持单节点名或列表
- `ev-test-conditional-edges`：测试验证路由函数的正确行为
- `ev-test-command-goto`：测试验证 Command(goto=...) 的动态路由

### claim-07-agent-loop-interrupt

**claim**：interrupt() 函数抛出 GraphInterrupt 暂停执行，必须配合 checkpointer 使用；通过 Command(resume=value) 恢复执行并将 value 作为 interrupt 返回值。

**含义解读**：interrupt 实现了 human-in-the-loop 模式。完整流程如下：
1. 节点代码调用 `answer = interrupt("请确认是否继续")`
2. 框架检查 scratchpad 中是否有对应的 resume 值
3. 没有 → 抛出 `GraphInterrupt`，暂停图执行，中断值发送给客户端
4. 客户端展示中断信息给用户，用户做出决定
5. 客户端调用 `graph.stream(Command(resume="confirmed"), config)`
6. 图从节点开头重新执行（replay），这次 interrupt() 找到 resume 值，直接返回

关键设计约束：节点代码必须是**幂等的**——interrupt 之前的逻辑会重新跑一遍。如果有副作用（如发送邮件），需要在 interrupt 之前做幂等检查。

**证据支持**：
- `ev-interrupt-func-code`：interrupt() 函数实现，追踪中断索引和 resume 值查找
- `ev-command-resume-code`：Command.resume 字段定义
- `ev-test-interrupt-resume`：测试验证暂停和恢复行为
- `ev-test-interrupt-multiple`：测试验证多次中断的状态持久化

## 相关测试证据

- **ev-test-conditional-edges**（`libs/langgraph/tests/test_pregel.py:2925-2976`）：构建带条件边的图，路由函数根据状态返回不同节点名。测试验证不同输入会走向不同分支。阅读时关注路由函数的签名 `(state: State) -> str` 和返回值格式。

- **ev-test-interrupt-resume**（`libs/langgraph/tests/test_pregel.py:4852-4920`）：构建包含 interrupt 的节点，第一次执行触发中断，第二次用 Command(resume=...) 恢复。测试验证 interrupt 的返回值是 resume 提供的值，且后续状态更新正确。

- **ev-test-interrupt-multiple**（`libs/langgraph/tests/test_pregel.py:5305-5722`）：验证同一节点中多个 interrupt 调用的行为——每次恢复只推进一个 interrupt，框架通过索引追踪匹配。这是 interrupt 最复杂的场景，证明了索引追踪机制的正确性。

## 真实源码解释

**add_conditional_edges 的实现**：将路由函数通过 `coerce_to_runnable` 转为 Runnable（支持 trace），然后包装为 `BranchSpec` 存入 `self.branches[source][name]`。name 从路由函数名推断，默认为 "condition"。编译时，Pregel 执行器会在源节点完成后执行所有注册的 branch，根据返回值确定下一步激活哪些节点。如果路由函数返回列表，会同时激活多个节点（扇出）。`path_map` 参数可选——如果提供，路由函数返回 key，path_map 映射为节点名；不提供则路由函数直接返回节点名。

**Command 的双重角色**：Command 既是节点返回值（告诉引擎如何路由），也是用户输入（`graph.stream(Command(resume=...))` 恢复中断）。四个字段各有用途：
- `graph`：指定命令目标图（None=当前图，`Command.PARENT`=父图），用于子图跨层通信
- `update`：原子性状态更新，通过 `_update_as_tuples` 转为 Channel 写入格式
- `goto`：路由目标，支持字符串、字符串列表和 Send 对象
- `resume`：恢复中断的值，支持 dict（按 interrupt ID 映射）或单值

**interrupt() 的状态机**：函数内部维护一个中断计数器（通过 `scratchpad.interrupt_counter()`）。每次调用递增索引。恢复执行时，节点从头重新运行：
1. 如果 `scratchpad.resume` 中有对应索引的值，直接返回（快速跳过已恢复的 interrupt）
2. 如果找到 `get_null_resume`（新的恢复值），消费它并追加到 resume 列表
3. 否则抛出 `GraphInterrupt`，携带 `Interrupt.from_ns` 创建的中断对象

这个三段式逻辑保证了多 interrupt 场景的正确性——每个 interrupt 按调用顺序与 resume 值一一对应。

**BranchSpec 的编译时绑定**：`BranchSpec.from_path(path, path_map, True)` 将路由函数和路径映射打包。第三个参数 `True` 表示这是一条"消费性"边——源节点的输出已被消费。编译时，每个源节点的 branches 会被转化为 Pregel 的超步后路由逻辑。

**Send 原语的 map-reduce 模式**：在条件边中，路由函数可以返回 `[Send("node_a", input1), Send("node_a", input2)]`。这会创建 node_a 的两个并行实例，各自接收不同输入——类似 MapReduce 的 map 阶段。每个 Send 实例独立执行，结果通过 reducer 聚合回主状态。这对于"并行处理多个子任务"的场景非常有用。

Send 的典型用例包括：并行查询多个数据源、并行调用多个 LLM 生成不同视角的回答、并行处理文档的多个章节。它与普通的“多节点并行”不同：Send 允许同一个节点的多个实例并行执行，每个实例有不同的输入。

**ReAct 循环的组装**：`create_react_agent` 中的图结构：
1. 添加 `agent` 节点（执行 LLM 推理，输出 AIMessage）
2. 添加 `tools` 节点（ToolNode 执行工具，输出 ToolMessage）
3. `START` → `agent`（入口边）
4. `agent` → `tools_condition`（条件边：有 tool_calls → "tools"，无 → END）
5. `tools` → `agent`（普通边：工具结果回到 agent 继续推理）

这个循环持续直到 LLM 不再产生 tool_calls——每一轮都是完整的"推理→执行→观察"周期。配合 checkpointer 时，可以在任意步骤中断并恢复。

**循环次数控制**：`create_react_agent` 支持 `recursion_limit` 参数限制最大循环次数，防止 LLM 无限调用工具。还可以通过 `interrupt_before`/`interrupt_after` 参数在指定节点前后自动中断，实现更细粒度的 human-in-the-loop 控制。

## 自测题

见 `../quizzes/07-agent-loop.quiz.md`。

## 掌握度验证

见 `../mastery/07-agent-loop.mastery.md`。

## 最小复刻任务

见 `../labs/07-mini-agent-loop/README.md`。

## 学完标准

- 能解释 add_conditional_edges 和 Command(goto=...) 两种路由方式的适用场景
- 能描述 interrupt/resume 的完整生命周期，包括多 interrupt 的索引匹配
- 能画出 ReAct 循环的完整图结构（节点 + 边 + 条件边）
- 能说明 Command 的 graph/update/goto/resume 四个字段各自的作用
- 理解 Send 如何在条件边中实现动态 map-reduce 扇出
- 能解释为什么 interrupt 要求节点代码幂等
