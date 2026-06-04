# 05 工具接口：ToolNode、InjectedState 与 ToolMessage

## 你会学到什么

- ToolNode 如何从 AIMessage 提取 tool_calls 并并行执行工具
- InjectedState 注解如何让工具函数获取当前图状态
- tools_condition 如何决定 ReAct 循环的路由走向
- ToolMessage 如何将工具结果回填到消息流中
- ToolNode 的错误处理策略如何影响 Agent 稳定性

## AI 概念从零解释

ToolNode 本质是一个"批量 RPC dispatcher"。想象一个微服务网关：上游（LLM）发出一批调用意图（tool_calls），网关并行路由到对应的 handler，收集结果后统一返回。

类比后端经验：
- **tool_calls** = 一批 RPC request（包含 method name + args + correlation ID）
- **ToolNode** = 网关/dispatcher，负责路由、并发执行和结果收集
- **InjectedState** = sidecar 注入的上下文（类似 gRPC interceptor 注入 metadata）
- **ToolMessage** = RPC response（带 tool_call_id 做关联）
- **tools_condition** = 网关前的 router，决定请求是否需要 dispatch
- **ToolCallRequest** = 内部调度单元，包含 tool_call、state、config 等运行时上下文

关键区别：这里的"调用方"是一个 LLM，它输出的是结构化意图而非真正的函数调用。框架负责把意图映射到真实执行。

整个流程形成闭环：LLM → AIMessage(tool_calls) → ToolNode → ToolMessage → 写回 messages Channel → LLM 在下轮看到结果。这个闭环是 ReAct 循环中"执行"阶段的核心。

## 源码阅读路径

- **repo**: langchain-ai/langgraph
- **commit**: 83dd61feaca993d2ee428706ad04c869895ce400
- **scope**: libs/prebuilt/
- **primary path**: `libs/prebuilt/langgraph/prebuilt/tool_node.py`
- **primary symbol**: `ToolNode`

**3 步阅读方法**：

1. **看类定义**（L622-740）：ToolNode 继承 RunnableCallable，初始化时将工具列表注册到 `tools_by_name` 字典，支持 BaseTool 实例和普通函数两种输入
2. **看 `_func` / `_afunc`**（L800-860）：从 input 解析 tool_calls → 为每个 call 构造 ToolRuntime → 用 executor.map 并行执行 → `_combine_tool_outputs` 合并输出
3. **看 `tools_condition`**：检查最后一条消息是否有 tool_calls，有则路由到 "tools" 节点，否则到 END

补充阅读：关注 `InjectedState` 类定义（同文件）和 `ToolCallRequest` 数据类，理解工具调用的完整上下文如何构建。还可以看 `_run_one` 方法理解单个工具的执行流程：参数注入 → 工具调用 → 结果包装。

## 关键 claims 与 evidence

**claim-05-tool-interface**：ToolNode 从输入 state 的最后一条 AIMessage 中提取 tool_calls，并行执行对应工具，返回 ToolMessage 列表写入 messages Channel。

这个 claim 描述了 ToolNode 的核心职责：它不做推理，只做执行。LLM 输出的 AIMessage 中包含一个或多个 tool_calls（结构化意图），ToolNode 提取这些意图，根据 tool name 在 `tools_by_name` 字典中查找注册的工具，并行调用，然后把每个结果包装成 ToolMessage（带 tool_call_id 关联）写回 messages Channel。这实现了"意图-执行-结果"的完整闭环。

**证据支持**：
- `ev-toolnode-class-code`：ToolNode 类定义，展示工具注册和输入解析逻辑
- `ev-toolnode-invoke-code`：`_func` 方法实现并行执行和结果收集
- `ev-test-tool-node-basic`：验证单个 tool_call 的正确解析和执行
- `ev-test-tool-node-parallel`：验证多个并行 tool_calls 的执行

## 相关测试证据

- **ev-test-tool-node-basic**（`libs/prebuilt/tests/test_tool_node.py:125-221`）：构造一个 AIMessage 包含 tool_calls，传入 ToolNode，验证输出为对应的 ToolMessage 列表。阅读时关注测试如何构造 tool_calls 数组和如何断言 ToolMessage 的 tool_call_id 匹配。这个测试覆盖了最基本的"调用意图 → 执行 → 结果"路径。

- **ev-test-tool-node-parallel**（`libs/prebuilt/tests/test_tool_node.py:222-268`）：构造包含多个 tool_calls 的 AIMessage，验证 ToolNode 并行执行所有工具并返回等量的 ToolMessage。关注 executor.map 的并行调度是否正确分发，以及多个 ToolMessage 的顺序是否与 tool_calls 顺序一致。

## 真实源码解释

**ToolNode 的设计选择**：继承 RunnableCallable 而非 BaseTool，因为它不是一个工具，而是一个执行多个工具的调度节点。初始化时接受工具列表，构建 `tools_by_name` 字典用于 O(1) 查找。`name` 默认为 `"tools"`，在图可视化中显示为 tools 节点。

**输入解析的三种模式**：ToolNode 支持 dict（图状态）、list（消息列表）和 tool_calls 列表三种输入。`_parse_input` 方法统一从中提取 `tool_calls` 数组。对于 dict 输入，从 `state[messages_key]` 的最后一条 AIMessage 中取；对于 list 输入，直接取末尾 AIMessage。

**并行执行策略**：`_func` 使用 `get_executor_for_config` 获取线程池，对所有 tool_calls 做 `executor.map` 并行执行。异步版本 `_afunc` 使用 `asyncio.gather`。每个 tool_call 独立构造 `ToolRuntime` 上下文，包含 state、config、store 等运行时信息。这意味着多个工具调用不会串行阻塞，但共享同一份 state 快照。

**InjectedState 机制**：通过 `_extract_state` 从输入中提取当前图状态，注入到 ToolRuntime 中。工具函数如果声明了 `Annotated[dict, InjectedState]` 参数，框架会自动注入状态，而这个参数不会暴露在 tool schema 中（LLM 看不到它）。这类似 Spring 的 `@Autowired`——框架注入运行时上下文，调用方无需感知。

**tools_condition 的路由逻辑**：这是一个简单的条件边辅助函数——检查 `state["messages"][-1]` 是否有 `tool_calls` 属性。有则返回 `"tools"`（路由到 ToolNode），无则返回 `END`（结束循环）。它是 ReAct 模式的"退出条件"。

**错误处理**：`handle_tool_errors` 支持多种策略——布尔值、字符串模板、异常类型过滤或自定义 callable。默认行为是捕获参数校验错误（模型给了错误参数）并返回错误描述作为 ToolMessage 内容，让 LLM 有机会在下一轮修正参数并重试。工具本身的执行异常默认会重新抛出。

**Command 工具的特殊处理**：如果工具返回 Command 对象而非普通值，ToolNode 会直接传递 Command 而非包装为 ToolMessage。`_combine_tool_outputs` 方法处理混合输出——普通 ToolMessage 和 Command 可以共存。这允许工具控制图的执行流程——例如工具执行后直接路由到特定节点，而不是回到 agent 继续推理。

**输出格式的自动适配**：ToolNode 根据输入类型自动决定输出格式。dict 输入返回 `{messages_key: [ToolMessage...]}`；list 输入返回 `[ToolMessage...]`。这保证了 ToolNode 可以无缝嵌入不同的图状态结构中。

## 自测题

见 `../quizzes/05-tool-interface.quiz.md`。

## 掌握度验证

见 `../mastery/05-tool-interface.mastery.md`。

## 最小复刻任务

见 `../labs/05-mini-tool-calling/README.md`。

## 学完标准

- 能解释 ToolNode 从 AIMessage 到 ToolMessage 的完整数据流
- 能说明 InjectedState 如何在不暴露给 LLM 的前提下注入图状态
- 能画出 agent → tools_condition → ToolNode → agent 的循环结构
- 能描述 ToolNode 的并行执行机制（executor.map / asyncio.gather）和错误恢复策略
- 理解 tool_call_id 如何实现请求-响应关联（类似 correlation ID）
- 能区分 ToolNode 输出 ToolMessage 和 Command 两种模式的适用场景
