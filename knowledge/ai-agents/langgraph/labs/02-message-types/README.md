# Mini Channel & Reducer — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 50-80 行 Python 复刻 TypedDict 状态解析 + Channel + Reducer 机制。
通过这个实验，你将深入理解 LangGraph 如何用 `Annotated[type, reducer]` 将状态字段映射为不同的 Channel 类型，以及 reducer 如何解决并行写入冲突。

## 背景

LangGraph 的状态管理核心问题是：当多个节点并行写入同一个字段时如何合并？答案是 **Channel + Reducer** 模式。无注解字段使用 `LastValue` Channel（最后写入者胜），`Annotated[type, reducer]` 字段使用 `BinaryOperatorAggregate` Channel（通过 reducer 函数聚合）。

这和 Redux 的 reducer 概念一样：`newState = reducer(oldState, action)`。预定义的 `add_messages` reducer 按消息 ID 合并（相同 ID 覆盖，新 ID 追加），这让消息管理有了"编辑"和"撤回"的能力。

## 任务

用纯 Python（无第三方依赖）实现：

1. `LastValueChannel`：只保留最后写入的值
2. `BinaryOpChannel`：接受一个 reducer 函数，每次写入时用 reducer 聚合新旧值
3. `parse_state_channels(schema)`：解析 TypedDict，根据 `Annotated` 注解决定每个字段用哪种 Channel

## 建议接口

```python
from typing import TypedDict, Annotated, get_type_hints, Any, Callable

class LastValueChannel:
    def __init__(self):
        self.value = None

    def update(self, value: Any):
        """直接覆盖：最后写入者胜"""
        ...

    def get(self) -> Any:
        ...


class BinaryOpChannel:
    def __init__(self, reducer: Callable[[Any, Any], Any], default: Any):
        self.reducer = reducer
        self.value = default

    def update(self, value: Any):
        """聚合：self.value = reducer(self.value, value)"""
        ...

    def get(self) -> Any:
        ...


def parse_state_channels(schema: type) -> dict[str, LastValueChannel | BinaryOpChannel]:
    """
    解析 TypedDict schema，返回 {field_name: channel} 映射。
    - Annotated[type, reducer] → BinaryOpChannel(reducer, default)
    - 普通字段 → LastValueChannel
    """
    ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：定义带 `Annotated[list, operator.add]` 的 TypedDict，验证多次 update 后值正确聚合（如 `[1] + [2] + [3] = [1,2,3]`）
2. **边界情况**：验证 LastValueChannel 多次 update 只保留最后一个值；验证 BinaryOpChannel 首次写入时的初始化行为

## 验收标准

- [ ] `parse_state_channels` 正确区分 Annotated 和非 Annotated 字段
- [ ] `LastValueChannel.update()` 只保留最后值
- [ ] `BinaryOpChannel.update()` 正确调用 reducer 聚合
- [ ] 支持自定义 reducer 函数（如 `operator.add`、列表拼接、消息合并）
- [ ] 代码不超过 80 行（不含测试）
- [ ] 测试全部通过

## 提示

- 用 `get_type_hints(schema, include_extras=True)` 获取包含 `Annotated` 信息的类型注解
- `Annotated[list, add_messages]` 的 `__metadata__` 属性包含 reducer 函数
- 初始值可以用 sentinel（如 `_MISSING`）标记"未初始化"状态
