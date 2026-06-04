# 持久化与远程集成：Checkpoint、Store、SDK 与部署边界 — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. BaseCheckpointSaver 定义了 `get_tuple/put/put_writes/list` 四个核心方法，分别对应：读取快照、写入快照、写入中间结果、列举历史。
2. InMemorySaver 使用三级 defaultdict（`storage[thread_id][checkpoint_ns][checkpoint_id]`）实现所有接口，支持多租户和子图命名空间隔离。
3. RemoteGraph 实现 PregelProtocol 接口，通过 LangGraphClient SDK 发起 HTTP 调用，让远程部署的图可以像本地子节点一样使用。
4. Checkpoint 是 event sourcing 的 snapshot（非增量日志），配合 `channel_versions` 做乐观并发控制。Store 是跨 thread 的共享状态存储。

## 代码阅读检查

- [ ] 能在 `base/__init__.py` L176-348 中找到 BaseCheckpointSaver 的方法签名，解释 `put` 和 `put_writes` 的调用时机差异
- [ ] 能在 `memory/__init__.py` L33-100 中找到 InMemorySaver 的 defaultdict 存储结构
- [ ] 能在 `pregel/remote.py` L118-200 中找到 RemoteGraph，说明它如何实现 `invoke/stream` 的远程委托
- [ ] 能解释 `checkpoint_ns` 如何支持子图的状态隔离——父图和子图的 checkpoint 如何共存

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（BaseCheckpointSaver 四方法 + InMemorySaver 内存实现 + RemoteGraph 远程代理）并引用 `ev-base-saver-code` 和 `ev-remote-graph-code`
- 引用 `ev-test-checkpoint-roundtrip` 和 `ev-test-react-agent-with-checkpoint` 说明持久化读写一致性的验证方式
- 完成 `labs/08-mini-provider-adapter/` 中的最小复刻实验（实现简化版 CheckpointSaver 接口和内存实现）
