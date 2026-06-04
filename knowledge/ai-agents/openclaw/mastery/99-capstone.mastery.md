# Capstone 掌握度检查

## 任务

画出并讲解一个 OpenClaw turn 的端到端路径：

```text
channel/node input -> Gateway/session routing -> runtime selection -> model stream -> tool calls -> tool results -> reply delivery
```

## 通过标准

- 能指出 `packages/agent-core/src/agent-loop.ts` 是低层循环，不是完整产品 runtime。
- 能解释 `src/agents/embedded-agent-runner/run.ts` 为什么复杂。
- 能解释 `src/acp/control-plane/manager.turn-runner.ts` 如何管理长期 turn。
- 能解释 plugin/provider 通过 SDK barrel 接入，而不是直接 import `src/**`。
- 能说清楚 DM pairing、allowlist、sandbox、tool policy 分别防什么风险。

