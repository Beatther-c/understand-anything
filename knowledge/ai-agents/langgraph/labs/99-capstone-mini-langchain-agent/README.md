# Capstone: Mini LangGraph Agent — 综合复刻实验

## 目标

不依赖 LangGraph 源码，用 80-120 行 Python 整合前 8 课的所有核心组件，构建一个完整的 mini ReAct Agent。
通过这个实验，你将验证对 LangGraph 整体架构的理解——从图构建、状态管理、模型适配、工具调用到循环控制和持久化。

## 背景

一个完整的 LangGraph Agent 包含以下组件协作：
- **StateGraph + compile**（Lab 01）：声明→编译→执行的三阶段模式
- **Channel + Reducer**（Lab 02）：messages 字段用 reducer 聚合，避免覆盖
- **节点函数**（Lab 03）：从 state 取消息、组装 prompt、调用模型、写回结果
- **模型适配**（Lab 04）：统一的 invoke 接口 + 工具绑定
- **ToolNode**（Lab 05）：并行执行工具调用、结果回填
- **事件流**（Lab 06）：stream 模式输出执行过程
- **Agent Loop**（Lab 07）：条件边 + ReAct 循环 + 中断恢复
- **Checkpoint**（Lab 08）：状态持久化，支持跨轮对话

本实验将这些组件组合为一个可运行的 mini agent，实现 ReAct 循环的完整闭环。

## 任务

用纯 Python（仅依赖标准库）实现一个完整的 mini agent，包含：

1. 图定义：2 个节点（agent + tools）+ 条件边路由
2. 状态管理：messages 字段使用 list append 作为 reducer
3. 模型节点：调用 mock LLM，根据 messages 决定是否调用工具
4. 工具节点：并行执行工具，结果回填 messages
5. 循环控制：tools_condition 检查 tool_calls 决定路由
6. 持久化：每步 checkpoint，支持从中断恢复

## 建议接口

```python
from dataclasses import dataclass, field
from typing import Callable, Any

# === 消息类型 ===
@dataclass
class Message:
    role: str
    content: str
    tool_calls: list[dict] = field(default_factory=list)
    tool_call_id: str | None = None

# === 状态 ===
class AgentState:
    """messages 字段使用 append reducer"""
    messages: list[Message]

# === Mini Agent ===
class MiniAgent:
    def __init__(self, model_fn: Callable, tools: list[Callable],
                 checkpointer=None):
        """
        model_fn: (messages, tools) -> Message  模拟 LLM
        tools: 工具函数列表
        checkpointer: 可选的 MiniCheckpointSaver
        """
        ...

    def invoke(self, input_messages: list[Message],
               thread_id: str = "default") -> list[Message]:
        """
        执行完整的 ReAct 循环：
        1. 初始化 state = {messages: input_messages}
        2. agent 节点：调用 model_fn 生成 AIMessage
        3. tools_condition：检查是否有 tool_calls
        4. tools 节点：并行执行工具，结果追加到 messages
        5. 循环直到无 tool_calls
        6. 每步保存 checkpoint
        7. 返回最终 messages
        """
        ...

    def stream(self, input_messages: list[Message],
               thread_id: str = "default"):
        """
        流式版本：yield 每步的 (node_name, state_update)
        """
        ...

    def resume(self, thread_id: str, resume_value: Any) -> list[Message]:
        """从 checkpoint 恢复执行"""
        ...
```

## 测试要求

编写至少 3 个测试：
1. **完整循环**：mock LLM 第一轮返回 tool_calls，第二轮返回纯文本。验证 agent 正确执行 2 轮循环并返回最终回复
2. **多工具并行**：mock LLM 返回 2 个 tool_calls，验证两个工具被并行执行且结果都出现在 messages 中
3. **checkpoint 恢复**：执行中途中断，验证从 checkpoint 恢复后继续执行并得到正确结果

## 验收标准

- [ ] 完整实现 ReAct 循环：agent → condition → tools → agent
- [ ] messages 使用 append 语义（不覆盖历史消息）
- [ ] 工具并行执行，结果正确关联 tool_call_id
- [ ] stream 模式逐步输出执行过程
- [ ] checkpoint 支持跨调用的状态恢复
- [ ] recursion_limit 防止无限循环（默认 25）
- [ ] 代码不超过 120 行（不含测试）
- [ ] 测试全部通过

## 提示

- 可以复用前 8 个 lab 的核心实现，组合到一个文件中
- mock LLM 的行为：检查最后一条 ToolMessage，如果有则生成最终回复；否则根据用户问题决定是否调用工具
- 最简 stream 实现：在 invoke 循环中 yield 每步结果即可
- checkpoint 恢复：get 最新 checkpoint → 从其 state 继续执行
- 这是综合实验，允许更高的行数上限（120 行），但鼓励精简
