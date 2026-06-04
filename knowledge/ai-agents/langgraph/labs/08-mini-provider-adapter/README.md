# Mini Checkpoint — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 60-100 行 Python 复刻 Checkpoint 序列化 + 存取 + 恢复机制。
通过这个实验，你将深入理解 LangGraph 如何通过 Checkpoint 将图执行状态持久化，实现中断恢复、对话记忆和时间旅行调试。

## 背景

持久化是让 Agent 从"一次性函数调用"升级为"有状态长期服务"的关键。`BaseCheckpointSaver` 定义了四个核心方法：`get_tuple`（读取快照）、`put`（写入快照）、`put_writes`（写入中间结果）、`list`（列举历史）。

`InMemorySaver` 用三级索引 `storage[thread_id][checkpoint_ns][checkpoint_id]` 存储快照。`thread_id` 隔离不同对话，`checkpoint_ns` 支持子图命名空间隔离，`checkpoint_id` 是每次快照的唯一标识。每个 Checkpoint 包含所有 Channel 的完整值 + 版本号，配合乐观并发控制。

## 任务

用纯 Python（仅依赖标准库 `json`/`uuid`）实现：

1. `MiniCheckpoint`：状态快照数据结构，包含 state + metadata + version
2. `MiniCheckpointSaver`：内存实现，支持 put/get/list 三个核心操作
3. 与图执行器集成：每步执行后自动保存 checkpoint，支持从任意 checkpoint 恢复

## 建议接口

```python
import json
import uuid
from typing import Any
from dataclasses import dataclass, field

@dataclass
class MiniCheckpoint:
    checkpoint_id: str
    thread_id: str
    state: dict
    metadata: dict = field(default_factory=dict)
    parent_id: str | None = None  # 前一个 checkpoint，形成链表

    def serialize(self) -> str:
        """序列化为 JSON 字符串"""
        ...

    @classmethod
    def deserialize(cls, data: str) -> "MiniCheckpoint":
        """从 JSON 字符串反序列化"""
        ...


class MiniCheckpointSaver:
    def __init__(self):
        # storage[thread_id] = [checkpoint1, checkpoint2, ...]
        self.storage: dict[str, list[MiniCheckpoint]] = {}

    def put(self, thread_id: str, state: dict, metadata: dict = None) -> MiniCheckpoint:
        """
        保存新 checkpoint：
        - 生成唯一 checkpoint_id
        - 记录 parent_id（前一个 checkpoint 的 ID）
        - 存入 storage
        """
        ...

    def get(self, thread_id: str, checkpoint_id: str = None) -> MiniCheckpoint | None:
        """
        读取 checkpoint：
        - 不指定 ID 则返回最新的
        - 指定 ID 则精确查找
        """
        ...

    def list(self, thread_id: str, limit: int = 10) -> list[MiniCheckpoint]:
        """列举该 thread 的历史 checkpoint（最新在前）"""
        ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：连续 put 3 个 checkpoint，验证 get 返回最新一个；验证 list 按时间倒序返回；验证 parent_id 形成正确链表
2. **边界情况**：验证序列化/反序列化的往返一致性（put → serialize → deserialize → 与原数据相等）；空 thread_id 的 get 返回 None

## 验收标准

- [ ] `put` 自动生成唯一 ID 和 parent_id 链接
- [ ] `get` 支持按 ID 精确查找和"取最新"两种模式
- [ ] `list` 支持 limit 参数和时间倒序
- [ ] 序列化/反序列化往返一致
- [ ] thread_id 隔离不同对话的 checkpoint
- [ ] 代码不超过 100 行（不含测试）
- [ ] 测试全部通过

## 提示

- checkpoint_id 用 `str(uuid.uuid4())` 生成即可
- parent_id 取 storage 中最后一个 checkpoint 的 ID
- 序列化用标准 `json.dumps/loads`，注意 state 中可能有非基本类型需要处理
- 实际 LangGraph 中 Checkpoint 还包含 channel_versions，这里简化为单一 state dict
