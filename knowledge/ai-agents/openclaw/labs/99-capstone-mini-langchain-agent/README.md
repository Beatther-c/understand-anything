# Capstone 实验：复刻一个 OpenClaw 风格最小运行时

> 目录名沿用学习页构建脚本的默认 capstone 路径；本实验内容是 OpenClaw，不是 LangChain。

## 目标

写一个最小伪实现，包含：

- `AgentMessage[]`
- `streamFn(model, context)`
- `ToolDefinition`
- `runLoop`
- `SessionManager`
- `PluginApi.registerTool/registerProvider`

## 要求

1. 工具调用必须生成 `ToolResultMessage` 并写回上下文。
2. session manager 必须同一 session 串行执行。
3. provider 必须通过注册表接入。
4. inbound message 必须经过 allowlist 检查。

## 对照源码

- `packages/agent-core/src/agent-loop.ts`
- `src/acp/control-plane/manager.core.ts`
- `src/plugin-sdk/provider-entry.ts`

