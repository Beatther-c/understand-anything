# 06 流式输出、调试事件与追踪

## 你会学到什么

- StreamMode 七种模式的设计意图和适用场景
- StreamMessagesHandler 如何实现 token 级流式输出
- StreamWriter 如何让节点向 custom 流写入自定义数据
- Pregel 执行循环如何驱动多模式并行输出
- 回调系统与 LangSmith 追踪的集成方式

## AI 概念从零解释

流式输出的本质是"观察者模式 + 多路复用"。类比后端经验：

- **StreamMode** = Kafka topic 的分区策略——同一个执行过程可以按不同维度（全量状态、增量更新、token 粒度、debug 事件）投递到不同"topic"
- **values 模式** = 每步结束后的 state snapshot（类似 event sourcing 的 projection）
- **updates 模式** = 增量 diff（类似 CDC change event，只包含本步修改的字段）
- **messages 模式** = LLM 输出的 token 流（类似 WebSocket 推送逐字符，前端可实时渲染打字效果）
- **custom 模式** = 节点内部主动 emit 的自定义事件（类似 OpenTelemetry span event）
- **checkpoints 模式** = 状态快照事件（类似数据库的 WAL checkpoint 通知）
- **tasks 模式** = 任务生命周期事件（类似分布式追踪中的 span start/end）
- **debug 模式** = checkpoints + tasks 的组合，用于开发环境全量观测
- **StreamMessagesHandler** = 一个 callback handler，拦截 LLM 的 `on_llm_new_token` 事件并转发到输出流

这些模式可以**组合使用**：`stream_mode=["values", "messages"]` 同时获取状态快照和 token 流。框架为每种模式独立输出，客户端可以按需消费。

## 源码阅读路径

- **repo**: langchain-ai/langgraph
- **commit**: 83dd61feaca993d2ee428706ad04c869895ce400
- **scope**: libs/langgraph/
- **primary path**: `libs/langgraph/langgraph/types.py`
- **primary symbol**: `StreamMode`

**3 步阅读方法**：

1. **看 StreamMode 定义**（`types.py:120-134`）：7 种 Literal 类型 + 详细注释说明每种模式的语义
2. **看 StreamMessagesHandler**（`pregel/_messages.py:49-`）：继承 BaseCallbackHandler，实现 `on_llm_new_token` 拦截 LLM 输出，包装为 `(message_chunk, metadata)` 元组
3. **看 Pregel.stream**（`pregel/main.py`）：理解执行循环如何根据 stream_mode 列表分发事件到不同输出通道

补充阅读：查看 `StreamWriter` 的类型定义（`types.py:136-139`）和 `GraphCallbackHandler`（`callbacks.py`），理解自定义流和图级事件的实现。还可以看 `SyncPregelLoop` 中的流式分发逻辑。

## 关键 claims 与 evidence

**claim-06-callback-tracing**：Pregel.stream() 支持多种 stream_mode（values/updates/messages/custom/debug），通过回调系统和 StreamMessagesHandler 实现 token 级流式输出。

这个 claim 的核心含义：LangGraph 的流式不是简单的"结束后返回"，而是在执行过程中通过多种模式持续输出。`values` 和 `updates` 在每个超步结束时输出；`messages` 通过回调机制实现 token 级粒度；`custom` 让节点开发者可以注入任意事件。这种设计让同一次执行可以同时服务"前端实时展示"和"后端调试追踪"两种需求。

**证据支持**：
- `ev-stream-mode-def-code`：StreamMode 类型定义，7 种模式的 Literal union
- `ev-stream-messages-handler-code`：StreamMessagesHandler 回调处理器，拦截 token 并转发
- `ev-test-stream-values`：验证多节点图的 stream 按步骤输出中间状态
- `ev-test-stream-messages`：验证 messages 模式正确输出 LLM token

## 相关测试证据

- **ev-test-stream-values**（`libs/langgraph/tests/test_pregel.py:555-684`）：构建两个节点的图，验证 `stream(mode="values")` 按执行顺序输出每步完整状态。阅读时关注测试如何断言输出顺序和状态累积——每步输出的是完整 state 而非 diff。

- **ev-test-stream-messages**（`libs/langgraph/tests/test_pregel.py:6986-7127`）：验证 `stream_mode="messages"` 结合 Command 时能正确输出 LLM 消息 token。关注测试如何模拟 LLM 的逐 token 输出和 StreamMessagesHandler 的转发行为。每个 token 输出都带有 metadata 标识来源节点。

## 真实源码解释

**StreamMode 的类型定义**：使用 `Literal` union 而非枚举，因为它需要支持字符串列表组合（`stream_mode=["values", "messages"]`）。7 种模式覆盖了从粗粒度（values）到细粒度（messages）再到完全自定义（custom）的全谱。注释中明确说明了 functional API 下 values 模式只在工作流结束时输出一次。

**StreamMessagesHandler 的设计**：继承 `BaseCallbackHandler` 和 `_StreamingCallbackHandler`，实现了 langchain_core 的回调协议。当 LLM 产生新 token 时，handler 将其包装为 `(message_chunk, metadata)` 元组推入输出流。metadata 包含节点名和命名空间信息（通过 `filter_to_user_tags`），让客户端知道 token 来自哪个节点的 LLM 调用。handler 还会过滤带有 `TAG_NOSTREAM` 或 `TAG_HIDDEN` 标签的节点。

**StreamWriter 的注入**：节点函数可以声明 `writer: StreamWriter` 参数，框架自动注入。当 `stream_mode` 包含 `"custom"` 时，调用 `writer(data)` 会将数据推入输出流；否则 writer 是 no-op（`Callable[[Any], None]`）。这是一种优雅的"按需激活"模式——节点代码不需要知道外部是否在监听。

**Pregel 循环的流式分发**：每完成一个超步，循环检查当前激活的 stream_mode 列表，分别将 values/updates/checkpoints 等数据推入对应的输出 channel。多种模式的数据通过 `StreamChunk` 协议统一格式化。这使得一次 stream 调用可以同时输出多种粒度的数据。

**debug 和 tasks 模式**：`debug` 是 `checkpoints` + `tasks` 的组合，用于开发调试。`tasks` 模式在 task 开始和结束时发射事件，包含节点名、执行结果和错误信息。这对于生产环境的可观测性至关重要——类似分布式追踪中的 span 事件。

**与 LangSmith 的集成**：LangGraph 的回调系统与 LangSmith 追踪天然集成。每个节点执行、LLM 调用、工具执行都会通过 callback 上报为 trace span，形成完整的执行时序图。GraphCallbackHandler 负责发射图级别的生命周期事件（如 GraphInterruptEvent、GraphResumeEvent）。

**多模式组合的实践建议**：前端实时展示用 `["messages"]`；后端监控用 `["updates", "tasks"]`；调试问题用 `["debug"]`；自定义进度上报用 `["custom"]`。多种模式可以组合，框架会为每种模式独立输出数据，互不干扰。

**节点过滤与 TAG**：通过给节点添加 `TAG_NOSTREAM` 或 `TAG_HIDDEN` 标签，可以让特定节点的输出不出现在 messages 流中。这对于隐藏内部处理节点（如工具执行）的 LLM 输出很有用——前端只需要看到最终 agent 节点的回复。

## 自测题

见 `../quizzes/06-callback-tracing.quiz.md`。

## 掌握度验证

见 `../mastery/06-callback-tracing.mastery.md`。

## 最小复刻任务

见 `../labs/06-mini-callback-tracer/README.md`。

## 学完标准

- 能列举 7 种 StreamMode 并说明各自的数据粒度和适用场景
- 能解释 StreamMessagesHandler 如何实现从 LLM token 到客户端流的转发
- 能描述 StreamWriter 的注入时机和 no-op 行为
- 理解 Pregel 超步循环如何驱动多模式并行输出
- 能为不同业务场景选择合适的 stream_mode 组合
- 理解 TAG_NOSTREAM 和 TAG_HIDDEN 如何控制节点输出的可见性
