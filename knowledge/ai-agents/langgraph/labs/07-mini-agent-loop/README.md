# Mini Agent Loop — 最小复刻实验

## 目标

不依赖 LangGraph 源码，用 80-120 行 Python 复刻条件边 + ReAct 循环 + interrupt/resume 机制。
通过这个实验，你将深入理解 LangGraph Agent Loop 的核心控制流——条件路由、循环执行和 human-in-the-loop 中断恢复。

## 背景

Agent Loop 是 LangGraph 的核心——它把"LLM 做决策、工具做执行"的循环用图的控制流表达出来。条件边（conditional edges）是 saga 编排器中的路由决策：节点完成后，路由函数检查状态决定下一个节点。

ReAct 循环的标准模式是：agent → tools_condition → tools → agent（循环），直到 LLM 不再产生 tool_calls。`interrupt()` 则实现了 human-in-the-loop：暂停执行、等待外部输入、恢复继续。这要求节点代码必须是**幂等的**——恢复时节点会从头重新执行。

## 任务

用纯 Python（无第三方依赖）实现：

1. `MiniGraphRunner`：支持条件边路由 + 循环执行的图运行器
2. `interrupt(value)`：在节点内暂停执行，返回中断值
3. `resume(graph, state, value)`：恢复中断的执行，将 value 作为 interrupt 的返回值

## 建议接口

```python
from typing import Callable, Any

class GraphInterrupt(Exception):
    """中断异常，携带中断值"""
    def __init__(self, value: Any):
        self.value = value


class MiniGraphRunner:
    def __init__(self):
        self.nodes: dict[str, Callable] = {}
        self.edges: dict[str, str] = {}                    # 普通边
        self.conditional_edges: dict[str, Callable] = {}   # 条件边

    def add_node(self, name: str, func: Callable):
        ...

    def add_edge(self, source: str, target: str):
        """添加普通边：source 完成后固定走 target"""
        ...

    def add_conditional_edge(self, source: str, router: Callable[[dict], str]):
        """添加条件边：source 完成后调用 router(state) 决定下一步"""
        ...

    def invoke(self, state: dict, resume_value: Any = None) -> dict:
        """
        从 START 开始执行：
        1. 按边/条件边决定下一个节点
        2. 执行节点，merge 结果到 state
        3. 遇到 GraphInterrupt 时保存中断状态并返回
        4. resume_value 不为 None 时，跳过已完成节点，恢复执行
        """
        ...


# 全局中断上下文（简化实现）
_resume_values: list = []

def interrupt(value: Any) -> Any:
    """
    暂停图执行：
    - 如果有 resume_value 可用，直接返回
    - 否则抛出 GraphInterrupt 暂停
    """
    ...
```

## 测试要求

编写至少 2 个测试：
1. **正常路径**：构建 ReAct 循环（agent → condition → tools → agent），模拟 2 轮工具调用后退出，验证循环次数和最终状态正确
2. **边界情况**：节点内调用 `interrupt("请确认")`，验证第一次执行抛出中断；第二次带 resume_value 调用时恢复执行并正确传递值

## 验收标准

- [ ] 条件边正确根据 router 返回值决定路由
- [ ] ReAct 循环能正确执行多轮后在条件边终止
- [ ] `interrupt()` 正确抛出 GraphInterrupt 暂停执行
- [ ] resume 后节点从头重执行，interrupt 返回 resume_value
- [ ] 支持 `recursion_limit` 防止无限循环
- [ ] 代码不超过 120 行（不含测试）
- [ ] 测试全部通过

## 提示

- 图执行用 while 循环 + current_node 指针实现
- 条件边优先于普通边：如果 source 有条件边，走条件边；否则走普通边
- interrupt/resume 的最简实现：用全局变量或 context 传递 resume_value
- recursion_limit：计数器超过阈值时抛出 RecursionError
