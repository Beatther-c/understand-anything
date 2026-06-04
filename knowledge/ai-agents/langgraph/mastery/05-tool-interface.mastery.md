# 工具接口：ToolNode、InjectedState 与 ToolMessage — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. ToolNode 是"批量 RPC dispatcher"：从最后一条 AIMessage 提取 tool_calls，按 tool name 在 `tools_by_name` 字典中查找，并行执行，结果包装为 ToolMessage（带 tool_call_id 关联）。
2. InjectedState 让工具函数获取当前图状态，但该参数不暴露在 tool schema 中（LLM 看不到），类似 Spring 的 `@Autowired` 注入。
3. tools_condition 是 ReAct 循环的退出条件：检查最后一条消息是否有 tool_calls，有→"tools"，无→END。
4. ToolNode 的错误处理策略支持多种模式（布尔值、字符串模板、异常过滤、自定义 callable），默认让 LLM 在下一轮修正参数。

## 代码阅读检查

- [ ] 能在 `tool_node.py` L622-740 中找到 ToolNode 类定义，解释 `tools_by_name` 字典的构建方式
- [ ] 能在 `tool_node.py` L800-860 中追踪 `_func` 方法的并行执行逻辑（executor.map）
- [ ] 能解释 `_parse_input` 如何支持 dict、list 和 tool_calls 三种输入模式
- [ ] 能说明 InjectedState 参数如何在不暴露给 LLM 的前提下注入图状态（ToolRuntime 的构建）
- [ ] 能区分工具返回 ToolMessage 和 Command 两种模式的适用场景

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（ToolNode 提取 tool_calls → 并行执行 → ToolMessage 写回 messages Channel）并引用 `ev-toolnode-class-code` 和 `ev-toolnode-invoke-code`
- 引用 `ev-test-tool-node-basic` 和 `ev-test-tool-node-parallel` 说明单个和并行 tool_calls 的验证方式
- 完成 `labs/05-mini-tool-calling/` 中的最小复刻实验（实现简化版 ToolNode 调度器）
