# 06 Callback / Tracing Quiz

## 概念题

1. 为什么 Agent 调试不能只看最终回答？
2. Callback handler 和 CallbackManager 的职责区别是什么？
3. `run_id` 和 `parent_run_id` 分别表达什么？
4. tags 和 metadata 在 tracing 中有什么价值？
5. 为什么 model、tool、chain 都要走同一套 callback 协议？

## 源码题

1. 找到 `BaseCallbackHandler` 的 mixin 组成，说明它覆盖哪些事件类型。
2. 找到 `on_chain_start` 和 `on_tool_start` 的签名，对比它们的参数。
3. 找到 `CallbackManager.on_chat_model_start`，说明它记录的输入为什么是 message list。
4. 找到 `ParentRunManager.get_child`，解释 child manager 如何继承 handlers、tags、metadata。
5. 找到 `CallbackManager.configure`，说明 inheritable/local callbacks 的意义。

## 设计题

1. 如果你设计 Agent tracing，会把 token streaming 作为日志、事件，还是 span？
2. callback handler 抛异常时，默认应该影响业务执行吗？
3. 哪些 prompt 或 tool result 不应该完整记录到 tracing 系统？

## 故障诊断题

1. 你只看到了 root run，看不到 chain 中每一步，可能漏了什么？
2. tool run 没有出现在 trace 里，你会检查 Tool.run 还是 RunnableConfig？
3. metadata 没有传到子步骤，应该检查 inheritable metadata 还是 local metadata？

## 迁移题

1. 用 Java / Spring 经验设计一个最小 callback handler。
2. 设计一个 tracing 输出格式，能展示 `prompt -> model -> tool -> model`。

