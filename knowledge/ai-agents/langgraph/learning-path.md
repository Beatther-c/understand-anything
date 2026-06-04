# LangGraph 学习路线

本路径面向有后端开发经验、正在系统学习 LLM/Agent 工程的学习者。课程从 LangGraph 状态图的核心抽象出发，逐步展开节点、边、工具、流式输出、Agent 循环和持久化的完整机制。

## 课程总览

1. **LangGraph 的可执行图**：从 StateGraph 到 CompiledStateGraph，理解 compile/invoke/stream 的统一执行模型。
2. **TypedDict、Reducer 与 MessagesState**：状态管理核心——Channel 如何聚合多节点写入。
3. **节点函数作为提示装配层**：add_node 与函数签名约定，理解节点如何读写状态。
4. **ChatModel 作为图节点**：create_react_agent 中的模型适配与 bind_tools 自动绑定。
5. **ToolNode 与工具接口**：tool_calls 解析、并行执行与 ToolMessage 回填。
6. **流式输出与回调追踪**：StreamMode 多模式流式、StreamMessagesHandler 与 token 级输出。
7. **条件边、Command、interrupt 与 ReAct 循环**：动态路由、人机交互中断与 Agent 循环编排。
8. **Checkpoint 持久化与远程部署**：BaseCheckpointSaver、InMemorySaver、RemoteGraph 与 SDK 集成。
9. **综合项目**：构建完整的可持久化 ReAct Agent（capstone）。

## 依赖关系

```
01-runnable (基础)
├── 02-message-schema
│   ├── 03-prompt-template
│   │   ├── 04-chat-model-adapter
│   │   │   ├── 05-tool-interface (也依赖 02)
│   │   │   │   └── 07-agent-loop (也依赖 03)
│   │   │   │       └── 08-provider-integration (也依赖 01)
│   │   │   │           └── 99-capstone (依赖 04, 05, 07, 08)
│   │   │   └── 99-capstone
│   │   └── 07-agent-loop
│   └── 05-tool-interface
└── 06-callback-tracing (独立分支，仅依赖 01)
```

**核心前置**：第 1 课是所有课程的前置。第 2-3-4-5-7-8 形成主线。第 6 课相对独立，可穿插学习。

## 推荐节奏

### Day 1：基础层（3-4 小时）

- 第 1 课：StateGraph 与 CompiledStateGraph
- 第 2 课：TypedDict、Channel 与 Reducer
- 完成 quiz 01、02 和 lab 01、02

### Day 2：节点与工具（3-4 小时）

- 第 3 课：add_node 与节点函数签名
- 第 4 课：create_react_agent 与模型适配
- 第 5 课：ToolNode 与工具接口
- 完成 quiz 03、04、05 和 lab 03、04、05

### Day 3：流式与循环（3-4 小时）

- 第 6 课：StreamMode 与回调追踪
- 第 7 课：条件边、Command 与 interrupt
- 完成 quiz 06、07 和 lab 06、07

### Day 4：持久化与综合（3-4 小时）

- 第 8 课：Checkpoint、Store 与远程部署
- 综合项目 99-capstone：构建完整 ReAct Agent
- 完成 quiz 08、99 和 lab 08、99
- 完成 mastery 全部验证

## 各单元学习目标

### 第 1 课：LangGraph 的可执行图

- 能解释 StateGraph.compile() 做了什么，返回的 CompiledStateGraph 与 Pregel 的关系
- 能在源码中定位 compile 方法和 CompiledStateGraph 类定义
- 能区分 invoke（同步完整执行）和 stream（逐步输出）的语义差异

### 第 2 课：TypedDict、Reducer 与 MessagesState

- 能解释 Annotated[type, reducer] 如何被解析为 BinaryOperatorAggregate Channel
- 能说明 LastValue Channel 与 BinaryOperatorAggregate Channel 的区别
- 能追踪 MessagesState 中 add_messages reducer 的工作方式

### 第 3 课：节点函数作为提示装配层

- 能解释 add_node 如何将普通函数包装为 RunnableCallable
- 能说明节点函数 (State) -> dict 签名中返回 dict 如何写入对应 Channel
- 能追踪函数名自动推断为节点名的逻辑

### 第 4 课：ChatModel 作为图节点

- 能解释 create_react_agent 如何自动 bind_tools
- 能追踪 _should_bind_tools 的判断逻辑
- 能说明 prompt|model 如何组成 agent 节点的执行链

### 第 5 课：ToolNode 与工具接口

- 能解释 ToolNode 如何从 AIMessage.tool_calls 提取调用请求
- 能说明并行工具执行的实现方式
- 能追踪 ToolMessage 如何写回 messages Channel

### 第 6 课：流式输出与回调追踪

- 能列举 StreamMode 支持的七种模式及各自用途
- 能解释 StreamMessagesHandler 如何拦截 LLM token 并转发到流
- 能区分 stream_mode="values" 和 stream_mode="messages" 的输出差异

### 第 7 课：条件边、Command 与 interrupt

- 能解释 add_conditional_edges 的路由函数如何决定下一个节点
- 能说明 Command(goto=...) 与 add_conditional_edges 的关系和取舍
- 能追踪 interrupt() → GraphInterrupt → Command(resume=value) 的完整中断恢复流程

### 第 8 课：Checkpoint 持久化与远程部署

- 能列举 BaseCheckpointSaver 的四个核心接口方法
- 能解释 InMemorySaver 的存储结构和读写流程
- 能说明 RemoteGraph 如何通过 SDK 连接远程 LangGraph 部署

### 综合项目：构建完整 ReAct Agent

- 能从零使用 StateGraph + MessagesState + ToolNode + 条件边 + Checkpoint 构建可持久化 Agent
- 能解释 create_react_agent 的完整图结构（节点、边、中断点）
- 能对构建的 Agent 进行中断、恢复和状态更新操作
