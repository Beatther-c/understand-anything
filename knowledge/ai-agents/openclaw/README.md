# OpenClaw 源码学习课程包

目标仓库：openclaw/openclaw

课程基准提交：`4bb86877e2cf4ae8edc4294de68a693b1119b7c3`

生成日期：2026-06-02

这是一份面向后端工程师的 OpenClaw 源码课程。它不会把 OpenClaw 当成普通 CLI 项目讲，而是按“个人 AI 助手平台”的真实工程边界来学习：Gateway、agent core、内置 runtime、工具策略、ACP 会话控制面、插件 SDK、Provider、渠道和设备节点。

## 怎么学习

1. 先读 [learning-path.md](learning-path.md)，按 8 个单元推进。
2. 每个单元读 `lessons/`，再做 `quizzes/`、`mastery/` 和 `labs/`。
3. 用 [learning.html](learning.html) 做主学习页，可对不懂的段落做疑问/笔记标注。
4. 遇到“证据不足”或“推断性说明”，看 [review/weak-evidence.md](review/weak-evidence.md)。

## 范围

重点源码范围：

- `packages/agent-core/`
- `src/agents/`
- `src/acp/`
- `src/plugin-sdk/`
- `packages/plugin-sdk/`
- `packages/gateway-protocol/`
- Android 节点测试中的设备/节点能力证据

## 产物

- 完整课程：`lessons/*.md`
- 自测题：`quizzes/*.quiz.md`
- 掌握度检查：`mastery/*.mastery.md`
- 实验：`labs/*/README.md`
- 证据图谱：`graph/*.json`
- UA 扫描结果：`raw/code-graph/*.scan-result.json` 与 `*.batches.json`
- 静态页面：`learning.html`

