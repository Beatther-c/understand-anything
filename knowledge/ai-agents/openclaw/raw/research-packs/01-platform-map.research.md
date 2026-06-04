# Research Pack: OpenClaw 全局架构：本地优先个人 AI 助手

## Research goal

为课程 `01-platform-map` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:01-platform-map`
- `concept:01-platform-map`

## Source entry points

- README.md: OpenClaw 的产品定位、支持渠道、Gateway、工具、节点、沙箱安全模型。
- docs/agent-runtime-architecture.md: runtime、session、tool、provider、plugin SDK 的分层说明。
- package.json: monorepo 脚本暴露了 gateway、agent、tui、插件、移动端与测试入口。

## Candidate claims

- `claim-01-platform-map`: 把 OpenClaw 先看成一个由 Gateway 调度的本地优先 agent 操作系统：消息入口、agent runtime、工具、插件、设备节点和 UI 都围绕同一个控制面工作。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-agent-loop-basic
- ev-test-acp-manager

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

