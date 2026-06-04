# 弱证据报告

## 已确认

- UA 确定性扫描已覆盖 `packages/agent-core`、`src/agents`、`src/acp`、`packages/plugin-sdk`。
- 课程中的核心 claims 都绑定了 code/docs/test evidence。
- 每个非导论单元至少绑定 2 个 test evidence。

## 限制

- 没有运行 live provider 测试，因为这通常需要外部模型凭据和真实渠道/设备环境。
- 没有使用 native slash-command subagents；本包使用 UA scan/batch + 源码人工证据编译生成 UA-compatible learning graph。
- Android/iOS/macOS 节点部分以测试和协议文件作为证据，没有构建移动端应用。

## 建议后续补强

- 在有凭据时运行 `OPENCLAW_LIVE_TEST=1 pnpm test src/agents/embedded-agent-runner-*.live.test.ts`。
- 为实际 channel 做一次 docker e2e 或真实测试箱验证。

