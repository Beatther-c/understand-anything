# 模型适配：把 ChatModel 当成图节点的一部分 — 自测题

## 选择题

### 1. `_should_bind_tools` 函数在什么情况下返回 False（不自动绑定工具）？

- A. 模型没有 `bind_tools` 方法时
- B. 模型已经是 `RunnableBinding` 且 kwargs 中包含 `tools` 键时
- C. tools 列表为空时
- D. 模型不支持流式输出时

**答案**: B

> `_should_bind_tools` 检查模型是否为 `RunnableBinding` 且 kwargs 有 `tools` 键，如果已绑定则返回 False。参见 `ev-should-bind-tools-code`（`chat_agent_executor.py` L173-198）。

### 2. create_react_agent 生成的图拓扑结构中，agent 节点的执行逻辑是什么？

- A. 直接调用 model.invoke(state)
- B. prompt_runnable | model 的 RunnableSequence（先组装消息，再调用模型）
- C. 遍历所有工具并选择最匹配的执行
- D. 将 state 序列化后发送到远程服务

**答案**: B

> agent 节点的执行逻辑是 `prompt | model`（RunnableSequence），先 run prompt 组装消息列表，再 pipe 给 model。参见 `ev-create-react-agent-code`（`chat_agent_executor.py` L278-500）。

### 3. LanguageModelLike 协议的最小满足条件是什么？

- A. 必须继承 BaseChatModel 基类
- B. 必须实现 invoke/ainvoke/stream/astream 四个方法
- C. 只要有 `invoke(messages: list[BaseMessage]) -> BaseMessage` 方法就满足
- D. 必须注册到 LangChain 的模型注册表中

**答案**: C

> LanguageModelLike 是鸭子类型协议——只要对象有 `invoke(messages) -> BaseMessage` 方法就能传入 create_react_agent，无需继承任何基类。

## 简答题

### 1. 请描述 create_react_agent 中 prompt 参数支持的 4 种形态，以及框架如何将它们统一包装为 prompt_runnable。

> 提示：字符串（转 SystemMessage）、SystemMessage 对象、Callable（动态生成）、Runnable。参考 `ev-create-react-agent-code`（`chat_agent_executor.py` L278-500）。

### 2. 为什么 agent 节点使用 `prompt | model` 的 pipeline 模式，而不是在节点函数中直接调用 `model.invoke(messages)`？请从组合性和可复用性角度分析。

> 提示：RunnableSequence 允许独立替换 prompt 或 model 组件，且支持 trace 和 streaming。参考 `ev-test-react-agent-prompt`（`test_react_agent.py` L148-168）。

### 3. 请解释 `_should_bind_tools` 的三种返回路径，以及为什么框架需要做工具数量一致性校验。

> 提示：已绑定相同工具→False，未绑定→True，绑定工具数量不匹配→抛异常。参考 `ev-should-bind-tools-code`。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
