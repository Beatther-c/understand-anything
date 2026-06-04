# Research Pack: 渠道、设备节点与安全默认值

## Research goal

为课程 `08-devices-channels-security` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- `lesson:08-devices-channels-security`
- `concept:08-devices-channels-security`

## Source entry points

- README.md: DM pairing、allowlist、sandbox 默认安全说明。
- packages/gateway-protocol/src/schema.ts: Gateway 协议 schema。
- apps/android/app/src/test/java/.../node 与 gateway 测试: Android 节点能力、设备认证、通知/相机/联系人等 handler。

## Candidate claims

- `claim-08-devices-channels-security`: OpenClaw 面对真实外部渠道和本机设备能力，所以安全模型必须默认把 inbound DM 当成不可信输入，并用 pairing、allowlist、sandbox、工具策略和节点权限收口。

## Key relations

见 `graph/relations.json`。

## Test evidence candidates

- ev-test-android-device-auth
- ev-test-gateway-protocol
- ev-test-android-node-handlers

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。

