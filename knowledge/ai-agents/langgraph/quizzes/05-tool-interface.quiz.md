# 工具接口：ToolNode、InjectedState 与 ToolMessage — 自测题

## 选择题

### 1. ToolNode 从输入中提取 tool_calls 的数据来源是什么？

- A. state 中专门的 `tool_calls` 字段
- B. state[messages_key] 的最后一条 AIMessage 中的 tool_calls 属性
- C. 上一个节点显式传递的参数
- D. 从全局配置中读取

**答案**: B

> ToolNode 从输入 state 的 `messages` 列表中取最后一条 AIMessage，提取其 `tool_calls` 数组。参见 `ev-toolnode-class-code`（`tool_node.py` L622-800）。

### 2. InjectedState 注解的作用是什么？

- A. 将工具参数暴露给 LLM 以便 LLM 决定传什么值
- B. 让工具函数获取当前图状态，但该参数不暴露在 tool schema 中（LLM 看不到）
- C. 强制工具在特定状态下才能执行
- D. 将工具的返回值注入到图状态中

**答案**: B

> InjectedState 让框架自动注入当前图状态到工具函数，但该参数不出现在 tool schema 中，LLM 无法感知它的存在。类似 Spring 的 `@Autowired`。

### 3. ToolNode 的并行执行策略是什么？

- A. 所有 tool_calls 串行执行，按顺序返回结果
- B. 使用 executor.map（同步）/ asyncio.gather（异步）并行执行所有 tool_calls
- C. 只执行第一个 tool_call，忽略其余
- D. 将所有 tool_calls 打包为一次批量请求

**答案**: B

> `_func` 使用 `get_executor_for_config` 获取线程池做 `executor.map` 并行执行，异步版本用 `asyncio.gather`。参见 `ev-toolnode-invoke-code`（`tool_node.py` L800-1000）。

## 简答题

### 1. 请描述 ToolNode 从 AIMessage 到 ToolMessage 的完整数据流，包括 tool_call_id 如何实现请求-响应关联。

> 提示：AIMessage.tool_calls[i].id == ToolMessage.tool_call_id，类似 RPC 的 correlation ID。参考 `ev-test-tool-node-basic`（`test_tool_node.py` L125-221）。

### 2. tools_condition 函数的路由逻辑是什么？它如何实现 ReAct 循环的"退出条件"？

> 提示：检查 `state["messages"][-1]` 是否有 `tool_calls` 属性，有→"tools"，无→END。参考课程中 tools_condition 的描述。

### 3. ToolNode 的 `handle_tool_errors` 支持哪些错误处理策略？为什么默认行为是返回错误描述而非直接抛出异常？

> 提示：布尔值、字符串模板、异常类型过滤、自定义 callable。让 LLM 有机会在下一轮修正参数并重试。参考 `ev-toolnode-class-code`。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
