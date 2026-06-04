# 模型适配：把 ChatModel 当成图节点的一部分 — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. `create_react_agent` 接受 `LanguageModelLike` 参数（鸭子类型协议），只要有 `invoke(messages) -> BaseMessage` 方法就能使用。
2. `_should_bind_tools` 智能判断：已绑定工具则跳过，未绑定则自动调用 `model.bind_tools(tools)`，绑定数量不一致则报错。
3. agent 节点的执行逻辑是 `prompt_runnable | model` 的 RunnableSequence——先组装消息列表，再调用模型。
4. 生成的图拓扑固定为 `agent → tools_condition → tools/END` 循环结构（经典 ReAct 模式）。

## 代码阅读检查

- [ ] 能在 `chat_agent_executor.py` L173-198 中找到 `_should_bind_tools` 的判断逻辑，说明三种返回路径
- [ ] 能在 `chat_agent_executor.py` L278-500 中追踪 `create_react_agent` 如何构建 StateGraph 并注册 agent/tools 节点
- [ ] 能解释 prompt 参数的 4 种形态（str/SystemMessage/Callable/Runnable）及其统一包装方式
- [ ] 能说明 `LanguageModelLike` 鸭子类型协议与 Java 显式接口实现的设计哲学差异

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（LanguageModelLike + 自动 bind_tools + prompt|model chain）并引用 `ev-create-react-agent-code` 和 `ev-should-bind-tools-code`
- 引用 `ev-test-react-agent-basic` 和 `ev-test-react-agent-prompt` 说明基本 ReAct 循环和 prompt 注入的验证方式
- 完成 `labs/04-mini-chat-model-adapter/` 中的最小复刻实验（实现简化版模型适配和 prompt pipeline）
