# Mini StateGraph — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 50-80 行 Python 复刻 StateGraph + compile + invoke 的最小图执行引擎。
通过这个实验，你将深入理解 LangGraph 的 Builder 模式（声明→编译→执行）和 Pregel 超步调度模型。

## 背景

LangGraph 的核心设计是"把 AI Agent 的执行逻辑建模为有向图"。`StateGraph` 是 Builder，通过 `add_node`/`add_edge` 声明图拓扑；`compile()` 将声明式定义冻结为不可变的 `CompiledStateGraph`；执行阶段通过 `invoke()` 驱动 Pregel 超步循环，按拓扑顺序调度节点。

这种"声明→编译→执行"三阶段分离是工程中常见的模式（类似 Makefile → make、Spring Bean 定义 → ApplicationContext），它让图定义阶段可以做充分验证，执行阶段只关心调度。

## 任务

用纯 Python（无第三方依赖）实现：

1. `MiniStateGraph`：Builder 类，支持 `add_node(name, func)` 和 `add_edge(source, target)` 声明图拓扑
2. `MiniCompiledGraph`：编译产物，支持 `invoke(state)` 按拓扑顺序执行节点
3. `MiniStateGraph.compile()`：验证图连通性后返回 `MiniCompiledGraph` 实例

## 建议接口

```python
from typing import TypedDict, Callable, Any

START = "__start__"
END = "__end__"

class MiniStateGraph:
    def __init__(self, state_schema: type):
        """初始化，接收 TypedDict 类型作为状态 schema"""
        ...

    def add_node(self, name: str, func: Callable[[dict], dict]):
        """注册节点：func 接收 state，返回 partial state 更新"""
        ...

    def add_edge(self, source: str, target: str):
        """添加有向边：source → target"""
        ...

    def compile(self) -> "MiniCompiledGraph":
        """验证图结构 → 生成拓扑排序 → 返回编译产物"""
        ...


class MiniCompiledGraph:
    def __init__(self, nodes, edges, entry_point, state_schema):
        ...

    def invoke(self, initial_state: dict) -> dict:
        """按拓扑顺序执行节点，每个节点的返回值 merge 到 state"""
        ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：3 个节点的线性图（A→B→C），验证 invoke 按序执行且状态正确传递
2. **边界情况**：编译时检测到无法从 START 到达 END 的断裂图，抛出 ValueError

## 验收标准

- [ ] `add_node` / `add_edge` 只做声明，不执行任何逻辑
- [ ] `compile()` 验证 START 到 END 的可达性
- [ ] `invoke()` 按拓扑顺序执行，每个节点返回的 dict merge 回 state
- [ ] 代码不超过 80 行（不含测试）
- [ ] 测试全部通过

## 提示

- 拓扑排序可用 Kahn 算法（BFS 入度法），10 行左右即可实现
- `invoke` 的核心循环：`for node in sorted_nodes: state.update(node_func(state))`
- 不需要实现 stream/async，先聚焦同步 invoke 即可
