# 持久化与远程集成：Checkpoint、Store、SDK 与部署边界 — 自测题

## 选择题

### 1. BaseCheckpointSaver 的四个核心方法是什么？

- A. save / load / delete / list
- B. get_tuple / put / put_writes / list
- C. read / write / update / query
- D. serialize / deserialize / store / retrieve

**答案**: B

> BaseCheckpointSaver 定义了 `get_tuple`（读取快照）、`put`（写入快照）、`put_writes`（写入中间结果）、`list`（列举历史）四个核心方法。参见 `ev-base-saver-code`（`base/__init__.py` L176-348）。

### 2. InMemorySaver 的存储索引结构是什么？

- A. 单层字典：storage[checkpoint_id]
- B. 两层字典：storage[thread_id][checkpoint_id]
- C. 三层字典：storage[thread_id][checkpoint_ns][checkpoint_id]
- D. 数据库表：thread_id + checkpoint_id 联合主键

**答案**: C

> InMemorySaver 使用三级 defaultdict：`storage[thread_id][checkpoint_ns][checkpoint_id]`，支持多租户和子图命名空间隔离。参见 `ev-inmemory-saver-code`（`memory/__init__.py` L33-100）。

### 3. RemoteGraph 如何实现本地图和远程部署的透明切换？

- A. 通过文件系统共享编译产物
- B. 实现 PregelProtocol 接口，通过 LangGraphClient SDK 发起 HTTP 调用
- C. 使用消息队列异步通信
- D. 通过 Python multiprocessing 在子进程中执行

**答案**: B

> RemoteGraph 继承 PregelProtocol，暴露与 CompiledStateGraph 相同的接口，内部通过 LangGraphClient 发起 HTTP 请求。参见 `ev-remote-graph-code`（`pregel/remote.py` L118-300）。

## 简答题

### 1. 请解释 `put` 和 `put_writes` 为什么被设计为两个独立方法，而不是合并为一个。它们各自的调用时机是什么？

> 提示：`put` 在超步结束时保存完整快照，`put_writes` 保存中间结果（细粒度持久化）。一个超步中多个节点的写入可以独立保存。参考 `ev-base-saver-code`。

### 2. 请描述 Checkpoint 与 Store 的职责边界差异。在什么场景下需要 Store 而 Checkpoint 不够用？

> 提示：Checkpoint 是"会话内的状态"（单个 thread），Store 是"会话间的记忆"（跨 thread 共享）。例如用户长期偏好数据。参考课程中 Store 的描述。

### 3. 为什么说 InMemorySaver 只适合开发测试？生产环境应该如何选择 checkpoint saver？请结合 `checkpoint_ns` 的设计说明子图状态隔离。

> 提示：InMemorySaver 不持久（进程重启即丢失）。生产用 PostgresSaver。`checkpoint_ns` 让子图有独立的命名空间。参考 `ev-test-checkpoint-roundtrip`（`test_memory.py` L210-220）。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
