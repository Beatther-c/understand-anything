# LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph — 自测题

## 选择题

### 1. StateGraph.compile() 返回的对象类型是什么？

- A. StateGraph 实例
- B. Pregel 实例
- C. CompiledStateGraph 实例（继承自 Pregel）
- D. RunnableCallable 实例

**答案**: C

> CompiledStateGraph 继承 Pregel，而 Pregel 实现了 Runnable 接口。参见 `ev-compiled-extends-pregel`（`state.py` L1391-1410）。

### 2. compile() 阶段的核心步骤不包括以下哪项？

- A. 验证图结构连通性
- B. 将 TypedDict 状态解析为 Channel 映射
- C. 执行第一个节点的 invoke 方法
- D. 将每个节点包装为 PregelNode 并 attach 到编译产物

**答案**: C

> compile() 只做"冻结"操作（验证→Channel 解析→实例化→attach 节点/边→validate），不执行任何节点逻辑。执行发生在后续的 invoke/stream 调用中。

### 3. Pregel 超步模型的核心特征是什么？

- A. 所有节点串行执行，按添加顺序依次处理
- B. 每个超步中就绪节点并行执行，通过 Channel 传递状态更新
- C. 每个节点独立运行在不同进程中，通过 RPC 通信
- D. 所有节点在同一线程中按拓扑排序执行

**答案**: B

> LangGraph 借鉴 Google Pregel 论文：每个超步中就绪节点并行执行，通过 Channel（消息管道）传递状态更新，由 reducer 决定如何聚合。

## 简答题

### 1. 请解释 StateGraph 为什么采用 Builder 模式（声明→编译→执行 三阶段），而不是直接在 add_node/add_edge 时就创建可执行图？

> 提示：考虑验证时机、不可变性保证、和 Pregel 引擎的初始化需求。参考 `ev-stategraph-compile-code`（`state.py` L1164-1388）。

### 2. CompiledStateGraph 为何继承 Pregel 而非直接实现 Runnable 接口？请从代码复用和抽象层次两个角度分析。

> 提示：Pregel 基类提供了超步调度、Channel 管理等核心能力。参考 `ev-compiled-extends-pregel`（`state.py` L1391-1410）和 Pregel 基类的职责。

### 3. 请描述 EphemeralValue(START) 作为输入 Channel 注入的设计意图，以及它如何让外部输入与节点间通信使用统一机制。

> 提示：从 compile() 中 START 通道的注入逻辑出发。参考 `ev-stategraph-compile-code` 中 Channel 创建部分。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
