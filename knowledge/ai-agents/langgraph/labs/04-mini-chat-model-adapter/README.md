# Mini Chat Model Adapter — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 50-80 行 Python 复刻模型适配器 + 工具绑定判断的机制。
通过这个实验，你将深入理解 LangGraph 如何通过适配器模式统一不同 LLM 提供商的接口，以及 `bind_tools` 的装饰器设计。

## 背景

在 Agent 系统中，不同 LLM 的 API 格式不同（OpenAI function calling、Anthropic tool use）。LangGraph 用**适配器模式**解决：定义 `LanguageModelLike` 协议（鸭子类型），任何实现 `invoke(messages)` 的对象都能用。`bind_tools` 不修改原模型，而是返回一个包装后的新对象（装饰器模式）。

`create_react_agent` 内部通过 `_should_bind_tools` 检查模型是否已绑定工具——如果已绑定则跳过，未绑定则自动调用 `model.bind_tools(tools)`。最终 agent 节点的执行逻辑是 `prompt | model` 的管道。

## 任务

用纯 Python（无第三方依赖）实现：

1. `MiniChatModel`：最小模型接口，支持 `invoke(messages)` 和 `bind_tools(tools)`
2. `MiniModelWithTools`：`bind_tools` 返回的包装对象，包含原模型 + 工具定义
3. `should_bind_tools(model, tools)`：判断模型是否需要自动绑定工具

## 建议接口

```python
from typing import Any
from dataclasses import dataclass

@dataclass
class Message:
    role: str       # "system" | "user" | "assistant" | "tool"
    content: str
    tool_calls: list[dict] | None = None
    tool_call_id: str | None = None


class MiniChatModel:
    def __init__(self, response_fn):
        """response_fn: (messages, tools) -> Message，模拟 LLM 响应"""
        self.response_fn = response_fn
        self.bound_tools = None

    def invoke(self, messages: list[Message]) -> Message:
        """调用模型，返回 assistant Message"""
        ...

    def bind_tools(self, tools: list[dict]) -> "MiniModelWithTools":
        """返回绑定了工具定义的新模型实例（装饰器模式）"""
        ...


class MiniModelWithTools:
    def __init__(self, base_model: MiniChatModel, tools: list[dict]):
        self.base_model = base_model
        self.tools = tools

    def invoke(self, messages: list[Message]) -> Message:
        """调用底层模型，传入工具定义"""
        ...

    def bind_tools(self, tools: list[dict]) -> "MiniModelWithTools":
        """重新绑定（覆盖旧工具列表）"""
        ...


def should_bind_tools(model, tools: list[dict]) -> bool:
    """
    判断是否需要自动绑定工具：
    - 如果 model 是 MiniModelWithTools 且已有工具 → False
    - 否则 → True
    """
    ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：创建模型 → bind_tools → invoke，验证工具定义被传入且响应正确
2. **边界情况**：验证 `should_bind_tools` 对已绑定模型返回 False，对未绑定模型返回 True

## 验收标准

- [ ] `bind_tools` 返回新对象，不修改原模型（装饰器模式）
- [ ] `MiniModelWithTools.invoke` 调用时将 tools 传递给底层 response_fn
- [ ] `should_bind_tools` 正确检测绑定状态
- [ ] 满足鸭子类型：`MiniChatModel` 和 `MiniModelWithTools` 都有 `invoke` 方法
- [ ] 代码不超过 80 行（不含测试）
- [ ] 测试全部通过

## 提示

- `bind_tools` 的关键是**不修改原对象**，返回新的包装实例
- `should_bind_tools` 用 `isinstance` 或 `hasattr` 检测即可
- response_fn 模拟 LLM 行为，可以根据 tools 是否存在决定是否返回 tool_calls
