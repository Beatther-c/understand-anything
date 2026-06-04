# 08 持久化与远程集成：Checkpoint、Store、SDK 与部署边界

## 你会学到什么

- BaseCheckpointSaver 的四个核心方法及其语义
- InMemorySaver 如何作为开发测试的参考实现
- Checkpoint 数据结构如何保存图的完整状态快照
- RemoteGraph 如何通过 SDK 实现本地/远程的透明切换
- checkpoint saver、store、SDK 三者的职责边界

## AI 概念从零解释

持久化是让 Agent 从"一次性函数调用"升级为"有状态长期服务"的关键。类比分布式系统经验：

- **BaseCheckpointSaver** = 分布式系统中的 State Store 接口（类似 Kafka Streams 的 StateStore 或 Flink 的 StateBackend）。定义了 `get_tuple/put/put_writes/list` 四个操作——读取快照、写入快照、写入中间结果、列举历史。

- **Checkpoint** = event sourcing 中的 snapshot。它不是增量日志，而是某一时刻所有 Channel 的完整值。配合 `channel_versions` 做乐观并发控制（类似数据库的 MVCC 版本号）。

- **InMemorySaver** = 类似 Redis 作为开发环境的 state backend——快但不持久。生产环境应换成 PostgresSaver（类似 Flink 从 MemoryStateBackend 切换到 RocksDBStateBackend）。

- **RemoteGraph** = 一个 HTTP 代理客户端，实现了与本地 CompiledStateGraph 相同的接口（PregelProtocol）。类似 gRPC 的 stub——调用方不知道也不关心对方是本地还是远程。它可以直接作为另一个图的子节点使用。

- **LangGraphClient SDK** = 类型安全的 HTTP 客户端，提供 threads/runs/assistants 等资源的 CRUD 操作。类似 Kubernetes client-go——它定义了"控制面"的 API 边界。

- **Store** = 跨 thread 的共享状态存储。如果 Checkpoint 是"会话内的状态"，Store 就是"会话间的记忆"（类似 Redis 中按 user_id 存储的长期偏好数据）。

## 源码阅读路径

- **repo**: langchain-ai/langgraph
- **commit**: 83dd61feaca993d2ee428706ad04c869895ce400
- **scope**: libs/checkpoint/ + libs/langgraph/ + libs/sdk-py/
- **primary path**: `libs/checkpoint/langgraph/checkpoint/base/__init__.py`
- **primary symbol**: `BaseCheckpointSaver`

**3 步阅读方法**：

1. **看 BaseCheckpointSaver**（`base/__init__.py:176-348`）：抽象基类定义 `get_tuple/put/put_writes/list/delete_thread` 接口，理解每个方法的输入输出语义
2. **看 InMemorySaver**（`memory/__init__.py:33-100`）：用 `defaultdict` 实现所有接口，理解 `storage[thread_id][checkpoint_ns][checkpoint_id]` 的三级索引结构
3. **看 RemoteGraph**（`pregel/remote.py:118-200`）：实现 `PregelProtocol`，通过 `LangGraphClient` 发起 HTTP 调用，关注 `invoke/stream` 如何委托到远程

补充阅读：查看 `CheckpointTuple`（`base/__init__.py`）理解快照的完整结构；看 `SerializerProtocol`（`serde/base.py`）理解序列化层；看 `LangGraphClient`（`libs/sdk-py/langgraph_sdk/client.py`）理解 SDK 的 API 设计。

## 关键 claims 与 evidence

**claim-08-provider-integration**：BaseCheckpointSaver 定义 get_tuple/put/put_writes/list 四个核心方法；InMemorySaver 是其内存实现；RemoteGraph 通过 SDK 连接远程部署。

**含义解读**：这个 claim 描述了 LangGraph 持久化层的分层架构。`BaseCheckpointSaver` 是接口层，定义了状态持久化的契约——任何实现这四个方法的类都可以作为图的 checkpointer。`InMemorySaver` 是最简参考实现，用内存字典存储，适合测试。`RemoteGraph` 则展示了另一个维度：通过 SDK 将一个远程部署的图当作本地节点使用。三者共同定义了"状态在哪里"和"图在哪里执行"的边界。

**证据支持**：
- `ev-base-saver-code`：BaseCheckpointSaver 抽象类定义，所有方法签名和文档
- `ev-inmemory-saver-code`：InMemorySaver 的 defaultdict 存储实现
- `ev-remote-graph-code`：RemoteGraph 通过 LangGraphClient 实现 PregelProtocol
- `ev-test-checkpoint-roundtrip`：验证 InMemorySaver 的读写一致性

## 相关测试证据

- **ev-test-checkpoint-roundtrip**（`libs/checkpoint/tests/test_memory.py:210-220`）：对 InMemorySaver 执行 put 写入一个 checkpoint，再用 get_tuple 读取，验证数据一致。阅读时关注 CheckpointTuple 的结构：它包含 checkpoint、config、metadata 和 parent_config，形成链表式版本历史。

- **ev-test-react-agent-with-checkpoint**（`libs/prebuilt/tests/test_react_agent.py:91-121`）：验证 create_react_agent 配合 checkpointer 后，执行中断和恢复时状态正确持久化。关注测试如何传入 `thread_id` 配置和如何验证恢复后的状态连续性。

## 真实源码解释

**BaseCheckpointSaver 的接口设计**：`get_tuple` 返回 `CheckpointTuple`（包含 checkpoint + config + metadata），`put` 接受 checkpoint + metadata + new_versions 并返回更新后的 config。`put_writes` 专门用于中间写入（task 产生的中间结果），与 `put` 分离是为了支持细粒度持久化——一个超步中多个节点的写入可以独立保存，不必等到超步结束。`list` 方法支持 filter、before 和 limit 参数，实现时间旅行调试。

**InMemorySaver 的索引结构**：三级 `defaultdict` — `storage[thread_id][checkpoint_ns][checkpoint_id]`。`thread_id` 是对话级别的隔离键，`checkpoint_ns` 支持子图的命名空间隔离，`checkpoint_id` 是每次快照的唯一标识。另外还有 `writes` 字典存储中间写入，`blobs` 字典存储 channel 的序列化值。这个结构直接映射了 LangGraph 的多租户 + 子图嵌套设计。

**SerializerProtocol 与 JsonPlusSerializer**：所有 checkpoint 数据在存储前需要序列化。`SerializerProtocol` 定义了 `dumps_typed/loads_typed` 接口，默认实现 `JsonPlusSerializer` 支持 JSON 扩展类型（如 datetime、bytes、set）。这意味着切换存储后端只需实现 BaseCheckpointSaver 接口，无需关心序列化细节。

**RemoteGraph 的透明代理**：继承 `PregelProtocol`，暴露与 CompiledStateGraph 相同的 `invoke/stream/get_state/update_state` 接口。内部通过 `LangGraphClient`（异步）或 `SyncLangGraphClient`（同步）发起 HTTP 请求。这意味着你可以用 `graph.add_node("remote", RemoteGraph("assistant-id", url="..."))` 把远程图当作本地子节点使用。

**SDK 的边界**：`libs/sdk-py/` 中的 `LangGraphClient` 提供 `threads`、`runs`、`assistants` 等资源的类型安全访问。它定义了 LangGraph Server API 的客户端边界——本地开发用 CompiledStateGraph 直接执行，生产环境用 SDK 调用远程部署。两者接口一致（PregelProtocol），切换只需改注入方式。

**StateSnapshot 与 get_state**：`get_state()` 返回 `StateSnapshot` 命名元组，包含 values/next/config/metadata/tasks/interrupts。这是检查图当前执行状态的标准方式——类似查看一个状态机"停在哪一步、下一步该做什么、是否有中断等待处理"。

**生产环境的选择**：开发用 InMemorySaver，生产用 PostgresSaver（`libs/checkpoint-postgres/`），LangSmith 部署时无需指定 checkpointer（平台自动管理）。如果你的图需要中断恢复、对话记忆或时间旅行调试，就必须配置 checkpointer；如果只是单次执行，可以不配置。

## 自测题

见 `../quizzes/08-provider-integration.quiz.md`。

## 掌握度验证

见 `../mastery/08-provider-integration.mastery.md`。

## 最小复刻任务

见 `../labs/08-mini-provider-adapter/README.md`。

## 学完标准

- 能说明 BaseCheckpointSaver 四个核心方法的语义和调用时机
- 能解释 InMemorySaver 的三级索引结构和它为什么只适合测试
- 能描述 RemoteGraph 如何实现本地图和远程部署的透明切换
- 理解 checkpoint_ns 如何支持子图的状态隔离
- 能为一个生产场景选择合适的 checkpoint saver 和部署拓扑
