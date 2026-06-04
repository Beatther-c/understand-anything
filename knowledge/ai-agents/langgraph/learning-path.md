# LangGraph 学习路线

## 路线总览

1. LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph
2. 状态与消息：TypedDict、Reducer 与 MessagesState
3. 节点函数即提示装配层：把业务上下文变成模型输入
4. 模型适配：把 ChatModel 当成图节点的一部分
5. 工具接口：ToolNode、InjectedState 与 ToolMessage
6. 流式输出、调试事件与追踪
7. Agent Loop：条件边、Command、interrupt 与 ReAct 循环
8. 持久化与远程集成：Checkpoint、Store、SDK 与部署边界

## 推荐节奏

- 第 1 天：01-02，建立图执行和状态合并心智模型。
- 第 2 天：03-05，理解模型、prompt 和工具如何嵌入图。
- 第 3 天：06-08，学习可观测性、agent loop、checkpoint 和 SDK 边界。
- 第 4 天：完成 capstone，并回看弱证据报告。

## 毕业要求

- 能从源码解释一个 ReAct agent 的一次执行路径。
- 能说明 checkpoint、interrupt、Command、ToolNode 的职责边界。
- 能独立设计一个有工具、有人工确认、有恢复能力的小型 Agent。
