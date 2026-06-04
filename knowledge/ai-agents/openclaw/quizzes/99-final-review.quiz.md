# OpenClaw 总复盘测试

1. 用 10 行以内描述 OpenClaw 的 Gateway、agent runtime、tool、provider、plugin、node 之间的关系。
2. 为什么 `agent-core` 不直接处理渠道和 OpenClaw 配置？
3. `runLoop` 在什么条件下继续下一轮？在什么条件下结束？
4. 工具系统为什么要同时有 schema normalization、policy、before/after hook、日志脱敏？
5. ACP session manager 为什么需要 actor queue 和 runtime handle cache？
6. 插件 SDK 的稳定 barrel 对生态有什么价值？
7. inbound DM 为什么默认不应直接进入 agent？

评分标准：能用源码文件名和至少 6 个 evidence id 支撑答案，视为通过。

