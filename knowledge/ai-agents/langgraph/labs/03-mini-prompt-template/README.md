# 节点函数即提示装配层：把业务上下文变成模型输入 - 最小实验

## 目标

实现一个不依赖 LangGraph 的最小版本，复刻本课概念：`Runtime, prompt, pre_model_hook`。

## 任务

1. 写一个 50-120 行的小程序，输入一个初始 state。
2. 至少包含两个节点、一个状态合并函数和一个可观察的中间事件。
3. 加两个测试：正常路径一个，失败或边界路径一个。
4. 在 README 末尾写 5 条对比：你的实现缺少 LangGraph 的哪些能力。

## 建议接口

```python
class MiniGraph:
    def add_node(self, name, fn): ...
    def add_edge(self, start, end): ...
    def invoke(self, state): ...
    def stream(self, state): ...
```

## 验收

- 能跑通输入到输出。
- 能解释状态如何合并。
- 能说明本课 evidence 中的测试为什么比你的实验更完整。
