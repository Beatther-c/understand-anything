# Agent Loop：条件边、Command、interrupt 与 ReAct 循环 - Quiz

## 选择题

1. 本课核心抽象主要解决什么问题？
   - A. 让 LLM 自动变聪明
   - B. 把 Agent 行为放进可测试、可恢复、可观测的软件结构
   - C. 替代所有业务代码
   - D. 只用于画流程图

2. 阅读 evidence 时最应该优先确认什么？
   - A. README 是否写得漂亮
   - B. claim 是否能被源码路径和测试断言支撑
   - C. 文件名是否足够短
   - D. 是否没有任何抽象

## 简答题

1. 用 5 句话以内解释 `add_conditional_edges, Command, interrupt, create_react_agent` 与本课 claim 的关系。
2. 从 `ev-test-interrupt-loop` 和 `ev-test-parent-command` 各选一个测试，说明它们分别证明了什么。
3. 如果你要把本课能力用于公司内部客服 Agent，你会新增哪两个失败路径测试？

## 参考答案

- 选择题：1-B，2-B。
- 简答题没有唯一答案，但必须引用本课源码路径、测试 evidence id，并能区分“源码证明”和“课程推断”。
