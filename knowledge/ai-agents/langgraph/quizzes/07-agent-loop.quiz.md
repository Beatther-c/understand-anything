# Agent Loop：条件边、Command、interrupt 与 ReAct 循环 — 自测题

## 选择题

### 1. 以下哪种方式不是 LangGraph 支持的动态路由机制？

- A. `add_conditional_edges(source, router_fn)` 注册路由函数
- B. 节点直接返回 `Command(goto="next_node")`
- C. 在 `add_edge` 中传入条件表达式字符串
- D. 条件边中路由函数返回列表实现并行扇出

**答案**: C

> LangGraph 支持两种路由方式：`add_conditional_edges` 注册路由函数，或节点返回 `Command(goto=...)`。`add_edge` 只用于静态边。参见 `ev-conditional-edges-code` 和 `ev-command-class-code`。

### 2. interrupt() 被调用后，如果 scratchpad 中没有对应的 resume 值，会发生什么？

- A. 返回 None 并继续执行
- B. 抛出 GraphInterrupt 异常，暂停图执行
- C. 自动跳过当前节点，执行下一个节点
- D. 等待一个超时时间后自动恢复

**答案**: B

> interrupt() 检查 resume 值，未找到则抛出 `GraphInterrupt`，暂停图执行。中断值发送给客户端，等待 `Command(resume=value)` 恢复。参见 `ev-interrupt-func-code`（`types.py` L811-934）。

### 3. Command 数据类的四个字段分别是什么？

- A. source / target / data / metadata
- B. graph / update / resume / goto
- C. node / edge / state / config
- D. input / output / next / prev

**答案**: B

> Command 包含 graph（目标图）、update（状态更新）、resume（恢复值）、goto（路由目标）四个字段。参见 `ev-command-class-code`（`types.py` L759-808）。

## 简答题

### 1. 请描述 interrupt/resume 的完整生命周期（6 步），并解释为什么节点代码必须是幂等的。

> 提示：节点调用 interrupt → 框架检查 resume → 无则抛 GraphInterrupt → 客户端展示 → 用户决定 → Command(resume=...) 恢复。恢复时节点从头重新执行。参考 `ev-test-interrupt-resume`（`test_pregel.py` L4852-4920）。

### 2. Send 原语如何在条件边中实现 map-reduce 动态并行调度？请举一个典型用例并说明它与普通"多节点并行"的区别。

> 提示：`[Send("node_a", input1), Send("node_a", input2)]` 创建同一节点的多个实例。区别在于 Send 允许同一节点的多个实例并行执行，每个实例有不同输入。参考课程中 Send 的描述。

### 3. 请画出 ReAct 循环的完整图结构（用文字描述节点和边的关系），并解释 `recursion_limit` 如何防止无限循环。

> 提示：START → agent → tools_condition（有 tool_calls → "tools"，无 → END）→ tools → agent。参考 `ev-test-conditional-edges` 和 `ev-test-command-goto`。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
