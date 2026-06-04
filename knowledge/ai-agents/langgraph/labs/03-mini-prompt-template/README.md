# Mini Node Function — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 50-80 行 Python 复刻节点函数注册 + 状态接收 + partial update 返回的机制。
通过这个实验，你将深入理解 LangGraph 节点函数如何作为"提示装配层"——从 State 取数据、组装 prompt、返回状态更新。

## 背景

在 LangGraph 中，节点不是框架提供的复杂类——它就是一个普通 Python 函数。`add_node` 将函数注册为节点，自动推断函数名为节点名。函数接收完整 State（TypedDict），返回一个 partial dict 表示"要更新的字段子集"。框架负责将返回值 merge 回 State。

这种设计让节点函数成为"提示装配层"：从 State 中提取业务上下文（用户消息、历史对话），拼装成 LLM prompt，调用模型后将结果写回 State。本实验聚焦这个"State → 装配 → 返回更新"的模式。

## 任务

用纯 Python（无第三方依赖）实现：

1. `MiniNodeRegistry`：支持通过装饰器或 `add_node` 注册函数，自动推断函数名为节点名
2. 节点执行器：接收 state，调用节点函数，将返回的 partial dict merge 回 state
3. 一个示例"提示装配"节点：从 state 提取 messages，拼装为 prompt 字符串，写回 state

## 建议接口

```python
from typing import Callable, Any

class MiniNodeRegistry:
    def __init__(self):
        self.nodes: dict[str, Callable] = {}

    def add_node(self, func_or_name, func=None):
        """
        支持两种用法：
        - add_node(my_func)       → 自动推断 'my_func' 为节点名
        - add_node('name', func)  → 显式指定节点名
        """
        ...

    def execute_node(self, name: str, state: dict) -> dict:
        """执行节点函数，将返回的 partial dict merge 回 state 副本"""
        ...

    def run_pipeline(self, node_names: list[str], initial_state: dict) -> dict:
        """按顺序执行多个节点，状态逐步累积"""
        ...


def assemble_prompt(state: dict) -> dict:
    """
    示例节点函数：从 state['messages'] 组装 prompt 字符串。
    返回 {'prompt': '组装后的 prompt 内容'}
    """
    ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：注册 2 个节点函数，pipeline 依次执行，验证 state 逐步更新（后一个节点能看到前一个节点的写入）
2. **边界情况**：未传显式名称时验证函数名自动推断；传入 lambda 时抛出错误要求显式指定名称

## 验收标准

- [ ] 支持函数名自动推断（`func.__name__`）
- [ ] 节点函数接收完整 state，返回 partial dict
- [ ] `execute_node` 不修改原 state（返回新副本）
- [ ] pipeline 按序执行，状态正确传递
- [ ] 代码不超过 80 行（不含测试）
- [ ] 测试全部通过

## 提示

- `getattr(func, '__name__', None)` 可获取函数名，lambda 的 `__name__` 是 `'<lambda>'`
- merge 语义：`{**state, **partial_update}`，新值覆盖旧值
- 节点函数应该是无副作用的纯函数——所有状态通过 state 传递
