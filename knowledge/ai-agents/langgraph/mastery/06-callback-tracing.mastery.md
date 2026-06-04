# 流式输出、调试事件与追踪 - 掌握度验证

## 口头讲解

不用看课程，向同事讲清楚：

- `stream, astream, debug events` 的输入、输出和边界。
- 为什么 LangGraph 需要这个抽象。
- 哪两个测试最能证明本课 claim。

## 代码阅读检查

- 在源码中定位 `Pregel.stream`。
- 找到本课至少一个错误处理或边界条件。
- 把测试断言与源码分支画成一条因果链。

## 通过标准

- 能解释 claim: `claim-06-callback-tracing`。
- 能引用至少 1 个 code evidence 和 2 个 test evidence。
- 能完成实验并写出“我的最小实现缺少 LangGraph 哪些生产能力”。
