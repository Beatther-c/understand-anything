# Mini Stream & Callback — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 60-100 行 Python 复刻事件流 + 回调追踪器机制。
通过这个实验，你将深入理解 LangGraph 的多模式流式输出设计（观察者模式 + 多路复用）以及回调系统如何实现 token 级流式转发。

## 背景

LangGraph 的流式输出不是简单的"结束后返回"，而是在执行过程中通过多种模式持续输出。核心设计是"观察者模式 + 多路复用"：

- **values 模式**：每步结束后输出完整 state 快照
- **updates 模式**：只输出本步修改的增量 diff
- **custom 模式**：节点内部主动 emit 的自定义事件

回调系统通过 `StreamMessagesHandler` 拦截 LLM 的 `on_new_token` 事件并转发到输出流，实现 token 级粒度的流式输出。节点可以通过 `StreamWriter` 注入自定义事件。

## 任务

用纯 Python（无第三方依赖）实现：

1. `MiniEventStream`：事件流，支持多种模式（values/updates/custom）的事件分发
2. `MiniCallbackHandler`：回调处理器，拦截节点执行事件（on_node_start/on_node_end/on_token）
3. `MiniStreamWriter`：注入节点的 writer，向 custom 流写入自定义数据

## 建议接口

```python
from typing import Any, Callable, Generator
from dataclasses import dataclass

@dataclass
class StreamEvent:
    mode: str       # "values" | "updates" | "custom"
    node: str       # 产生事件的节点名
    data: Any       # 事件数据

class MiniCallbackHandler:
    def __init__(self):
        self.events: list[dict] = []

    def on_node_start(self, node_name: str, state: dict):
        """节点开始执行时回调"""
        ...

    def on_node_end(self, node_name: str, result: dict):
        """节点执行结束时回调"""
        ...

    def on_token(self, node_name: str, token: str):
        """LLM 产生新 token 时回调"""
        ...


class MiniEventStream:
    def __init__(self, stream_modes: list[str]):
        """初始化，指定激活的流模式列表"""
        self.modes = set(stream_modes)
        self.buffer: list[StreamEvent] = []

    def emit(self, mode: str, node: str, data: Any):
        """向指定模式的流中写入事件（模式未激活则忽略）"""
        ...

    def stream(self) -> Generator[StreamEvent, None, None]:
        """消费并 yield 所有缓冲的事件"""
        ...


class MiniStreamWriter:
    def __init__(self, event_stream: MiniEventStream, node_name: str):
        ...

    def __call__(self, data: Any):
        """向 custom 流写入自定义数据"""
        ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：配置 `["values", "updates"]` 双模式，模拟 2 个节点执行，验证 stream 输出包含两种模式的事件且顺序正确
2. **边界情况**：未激活的模式（如 custom）调用 emit 时被静默忽略；验证 StreamWriter 在 custom 模式未激活时是 no-op

## 验收标准

- [ ] 支持多种 stream_mode 的组合配置
- [ ] 未激活模式的 emit 是 no-op（不报错、不缓冲）
- [ ] CallbackHandler 记录完整的节点执行生命周期事件
- [ ] StreamWriter 正确向 custom 流写入数据
- [ ] 代码不超过 100 行（不含测试）
- [ ] 测试全部通过

## 提示

- 事件缓冲用简单的 list 即可，`stream()` 消费时 pop
- `StreamWriter` 本质是对 `event_stream.emit("custom", node, data)` 的闭包封装
- CallbackHandler 可以同时更新 EventStream，实现"回调驱动流式输出"
