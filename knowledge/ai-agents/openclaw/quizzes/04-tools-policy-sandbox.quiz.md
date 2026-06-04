# 工具系统：定义、策略、沙箱与执行前后钩子 自测题

1. 本课抽象解决了什么工程问题？
2. 请写出本课最重要的 3 个源码入口。
3. 用自己的话解释这个路径：`tool catalog -> policy pipeline -> model-compatible schema -> beforeToolCall -> execute -> afterToolCall -> ToolResultMessage`。
4. 本课至少两个测试证据是什么？它们分别证明什么？
5. 如果你要修改这一层，最容易破坏的契约是什么？

## 参考答案方向

- 必须引用 `claim-04-tools-policy-sandbox`。
- 必须至少引用两个 evidence id：ev-test-tool-adapter, ev-test-tool-policy, ev-test-tool-construction。
- 答案要区分“代码证据”“测试证据”和“推断”。

