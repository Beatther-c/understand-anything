# Open Questions

课程生成过程中发现的开放问题，值得后续深入研究。

## 源码设计决策

1. **为什么选择 Pregel 模型？** LangGraph 的执行引擎命名为 Pregel，借鉴 Google 的 BSP（Bulk Synchronous Parallel）模型。但 LLM Agent 工作流与图计算的 superstep 模式差异较大——为什么不选择更简单的 DAG 调度器或 actor 模型？是否因为 checkpoint/replay 的需求与 Pregel 的 barrier 语义天然契合？

2. **Channel 抽象的必要性？** 为什么不直接使用 dict 存储状态，而要引入 Channel（LastValue、BinaryOperatorAggregate 等）这一层抽象？是否为了支持并发写入时的一致性保证？如果是，当前 GIL 下的 Python 实现是否真的需要这种保护？

3. **Command vs 条件边的设计取舍？** `Command(goto=...)` 和 `add_conditional_edges` 提供了两种路由方式。源码中为什么同时保留两种？是否因为 Command 支持节点内部的动态决策（无需提前注册所有可能路径），而条件边更适合静态声明式图？

4. **StateGraph vs MessageGraph 的演进？** 早期 LangGraph 有 `MessageGraph`（已 deprecated），为什么最终统一为 `StateGraph + MessagesState`？这个设计决策是否与 multi-agent 场景下不同 agent 需要不同 state schema 有关？

## 文档与实现不一致

5. **interrupt 的文档示例与实际行为？** 官方文档中 interrupt 的示例通常是简单的单次中断，但源码中 `interrupt()` 支持同一节点内多次调用（通过索引追踪）。这种高级用法在文档中几乎未提及，可能导致用户误用。

6. **StreamMode 的完整列表？** types.py 中定义了 7 种 StreamMode，但官方文档通常只介绍 values/updates/messages 三种。debug/custom/checkpoints/tasks 模式的使用场景和稳定性需要进一步确认。

7. **ToolNode 的错误处理策略？** ToolNode 有 `handle_tool_errors` 参数，但错误处理的具体行为（是否重试、如何报告给 LLM）在文档和源码注释中描述不够清晰。

## 值得深入研究的方向

8. **Subgraph 与 multi-agent 编排**：LangGraph 支持将一个 compiled graph 嵌套为另一个图的节点（subgraph）。这对于 multi-agent 系统的状态隔离和通信模式有什么影响？

9. **Checkpoint 的存储后端扩展**：除了 InMemorySaver，LangGraph 提供 PostgresSaver、SQLiteSaver 等。这些实现在高并发场景下的性能特征和一致性保证是什么？

10. **与 LangChain 的解耦程度**：LangGraph 在多大程度上可以脱离 LangChain 使用？ToolNode 依赖 `langchain_core.messages`，但核心图引擎是否可以独立运行？

11. **Map-Reduce 并行节点**：LangGraph 的 `Send` API 支持动态扇出（fan-out）到多个并行节点。这种模式在实际生产中的使用频率和最佳实践是什么？

12. **长时间运行 Agent 的状态管理**：对于运行数小时甚至数天的 Agent（如 background tasks），checkpoint 的存储增长和 GC 策略如何设计？
