# 会话与 ACP 控制面：把一次 turn 变成可管理任务 掌握度验证

## 口头讲解

请在 5 分钟内讲清：

- 这个抽象在 OpenClaw 中为什么存在。
- 它和上一层/下一层的边界是什么。
- 它的失败模式是什么。

## 源码定位

不看课程正文，直接在仓库中定位：

- `src/acp/control-plane/manager.core.ts`
- `src/acp/control-plane/manager.turn-runner.ts`
- `src/acp/control-plane/session-actor-queue.ts`

## 通过标准

- 能解释 `sessionKey -> actor queue -> runtime handle -> runTurn stream -> background progress -> terminal state`。
- 能把至少两个 test evidence 讲成行为契约，而不是只念文件名。
- 能指出一个可能的重构风险。

