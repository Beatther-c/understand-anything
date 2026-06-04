# LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. StateGraph 是 Builder 模式的实现：`add_node`/`add_edge` 只做声明，`compile()` 才生成可执行产物。
2. `compile()` 做 5 件事：验证图连通性 → 解析 TypedDict 为 Channel 映射 → 实例化 CompiledStateGraph → attach 节点和边 → validate。
3. CompiledStateGraph 继承 Pregel，Pregel 实现 Runnable 接口，因此编译后的图拥有 invoke/stream/ainvoke/astream 能力。
4. Pregel 超步模型驱动执行：每个超步中就绪节点并行执行，通过 Channel 传递状态更新，由 reducer 决定聚合策略。

## 代码阅读检查

- [ ] 能在 `state.py` L1164-1388 中找到 `compile()` 方法的完整实现，并指出验证、Channel 创建和实例化的关键行
- [ ] 能在 `state.py` L1391-1410 中确认 `CompiledStateGraph` 的继承声明 `Pregel[StateT, ContextT, InputT, OutputT]`
- [ ] 能追踪 `compile()` 如何将 `self.nodes` 中的声明转化为 `PregelNode` 绑定到编译产物
- [ ] 能解释 `EphemeralValue(START)` 作为输入 Channel 的设计选择——为什么不直接传参给第一个节点

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（compile→CompiledStateGraph→Pregel→Runnable 链路）并引用 `ev-compiled-extends-pregel` 和 `ev-stategraph-compile-code`
- 引用 `ev-test-compile-invoke` 和 `ev-test-stream-basic` 说明 invoke 和 stream 的验证方式
- 完成 `labs/01-mini-runnable/` 中的最小复刻实验（实现简化版 StateGraph → compile → invoke 流程）
