# 插件 SDK 与 Provider 扩展：把生态接入运行时 掌握度验证

## 口头讲解

请在 5 分钟内讲清：

- 这个抽象在 OpenClaw 中为什么存在。
- 它和上一层/下一层的边界是什么。
- 它的失败模式是什么。

## 源码定位

不看课程正文，直接在仓库中定位：

- `src/plugin-sdk/plugin-entry.ts`
- `src/plugin-sdk/provider-entry.ts`
- `src/plugin-sdk/provider-tools.ts`

## 通过标准

- 能解释 `plugin manifest -> definePluginEntry -> register(api) -> provider/tool/session/action hooks -> runtime consumes SDK barrels`。
- 能把至少两个 test evidence 讲成行为契约，而不是只念文件名。
- 能指出一个可能的重构风险。

