# Mini ToolNode — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 60-100 行 Python 复刻 ToolNode 的并行工具调用 + 结果回写机制。
通过这个实验，你将深入理解 LangGraph 如何将 LLM 输出的 tool_calls 意图分发到对应工具、并行执行、并将结果以 ToolMessage 形式回填到状态中。

## 背景

ToolNode 本质是一个"批量 RPC dispatcher"。LLM 输出的 AIMessage 中包含一个或多个 `tool_calls`（结构化调用意图），ToolNode 提取这些意图，在 `tools_by_name` 字典中查找对应工具，并行调用，然后把每个结果包装成 ToolMessage（带 `tool_call_id` 关联）写回 messages Channel。

整个流程形成闭环：LLM → AIMessage(tool_calls) → ToolNode → ToolMessage → 写回 state → LLM 在下轮看到结果。这是 ReAct 循环中"执行"阶段的核心。

## 任务

用纯 Python（仅依赖标准库 `concurrent.futures`）实现：

1. `MiniToolNode`：注册工具函数，从 state 的最后一条 AIMessage 提取 tool_calls，并行执行
2. `tools_condition(state)`：检查最后一条消息是否包含 tool_calls，返回路由决策
3. ToolMessage 数据结构：包含 `tool_call_id` + `content` 字段

## 建议接口

```python
from dataclasses import dataclass, field
from typing import Callable, Any
from concurrent.futures import ThreadPoolExecutor

@dataclass
class ToolCall:
    id: str
    name: str
    args: dict

@dataclass
class AIMessage:
    content: str
    tool_calls: list[ToolCall] = field(default_factory=list)

@dataclass
class ToolMessage:
    content: str
    tool_call_id: str


class MiniToolNode:
    def __init__(self, tools: list[Callable]):
        """注册工具列表，构建 name → func 的查找字典"""
        self.tools_by_name: dict[str, Callable] = {}
        ...

    def invoke(self, state: dict) -> dict:
        """
        1. 从 state['messages'][-1] 提取 tool_calls
        2. 并行执行每个 tool_call 对应的工具函数
        3. 返回 {'messages': [ToolMessage(...), ...]}
        """
        ...

    def _run_one(self, tool_call: ToolCall) -> ToolMessage:
        """执行单个工具调用，返回 ToolMessage"""
        ...


def tools_condition(state: dict) -> str:
    """
    检查 state['messages'][-1] 是否有 tool_calls：
    - 有 → 返回 "tools"
    - 无 → 返回 "__end__"
    """
    ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：注册 2 个工具函数，构造包含 2 个 tool_calls 的 AIMessage，验证并行执行后返回 2 个 ToolMessage 且 tool_call_id 正确关联
2. **边界情况**：tool_call 引用了未注册的工具名时，返回包含错误信息的 ToolMessage（而非抛异常）

## 验收标准

- [ ] 工具通过函数名自动注册到 `tools_by_name` 字典
- [ ] 并行执行多个 tool_calls（使用 ThreadPoolExecutor）
- [ ] 每个 ToolMessage 的 `tool_call_id` 与对应 ToolCall 的 `id` 匹配
- [ ] 工具不存在时优雅降级（返回错误 ToolMessage 而非崩溃）
- [ ] `tools_condition` 正确判断路由
- [ ] 代码不超过 100 行（不含测试）
- [ ] 测试全部通过

## 提示

- `ThreadPoolExecutor.map(self._run_one, tool_calls)` 实现并行
- 工具函数用 `func.__name__` 作为注册名，和 tool_call.name 匹配
- 错误处理：`try/except` 包裹每个工具调用，失败时返回错误描述作为 ToolMessage 内容
