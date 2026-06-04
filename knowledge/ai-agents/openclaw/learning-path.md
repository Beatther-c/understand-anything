# OpenClaw 学习路线

## 课程目标

学完后，你应该能从源码解释一个 OpenClaw turn 如何从外部消息进入 Gateway，经由 session/runtime/tool/provider，最后产出回复或工具结果；也能设计一个小型 provider/plugin/tool，并说清楚它该放在哪个边界里。

## 路线

1. **OpenClaw 全局架构：本地优先个人 AI 助手**：把 OpenClaw 先看成一个由 Gateway 调度的本地优先 agent 操作系统：消息入口、agent runtime、工具、插件、设备节点和 UI 都围绕同一个控制面工作。
2. **Agent Core：从消息到工具调用的最小循环**：agent loop 的本质是一个事件驱动的状态机：追加用户消息，调用模型流，提取工具调用，执行工具，把工具结果写回上下文，再决定是否继续。
3. **消息、上下文与流式事件**：LLM 应用不是一次请求一次字符串，而是一组消息、系统提示、工具定义和流式事件的组合。OpenClaw 把 partial assistant message 放入上下文并随事件更新。
4. **工具系统：定义、策略、沙箱与执行前后钩子**：工具调用是 agent 产生外部影响的边界。OpenClaw 同时处理 schema 规范化、allow/deny 策略、沙箱路径、before/after hook、执行顺序和错误归一化。
5. **内置 Runtime：模型选择、Provider、重试与故障转移**：OpenClaw 的内置 runner 把低层 loop 包装成可运营的运行时：选择模型、准备认证、构建 prompt 和工具、处理空回复/溢出/限流/计费错误、记录 usage，并在必要时故障转移。
6. **会话与 ACP 控制面：把一次 turn 变成可管理任务**：agent 不是孤立函数调用，而是有 session key、runtime handle、active turn、取消、超时、后台任务进度和 backend failover 的长生命周期对象。
7. **插件 SDK 与 Provider 扩展：把生态接入运行时**：插件 SDK 是 OpenClaw 的扩展边界：插件可以注册 provider、工具、命令、会话 action、hook、UI、模型目录和安全审计能力。
8. **渠道、设备节点与安全默认值**：OpenClaw 面对真实外部渠道和本机设备能力，所以安全模型必须默认把 inbound DM 当成不可信输入，并用 pairing、allowlist、sandbox、工具策略和节点权限收口。

## 学习节奏

- 第 1 天：单元 1-2，建立全局架构和低层 agent loop 模型。
- 第 2 天：单元 3-4，掌握消息流、工具调用、策略和沙箱。
- 第 3 天：单元 5-6，学习生产级 runtime、会话控制面和 ACP。
- 第 4 天：单元 7-8，学习插件生态、Provider、渠道/节点安全。
- 第 5 天：做 capstone，把一个最小 OpenClaw 风格 agent runtime 画出来并写伪实现。

