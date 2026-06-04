# 流式输出、调试事件与追踪 — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. StreamMode 定义了 7 种模式（values/updates/messages/custom/checkpoints/tasks/debug），覆盖从粗粒度到细粒度的全谱，可组合使用。
2. StreamMessagesHandler 继承 BaseCallbackHandler，拦截 `on_llm_new_token` 事件，将 token 包装为 `(message_chunk, metadata)` 推入输出流，实现 token 级流式。
3. StreamWriter 通过参数注入给节点函数，当 stream_mode 包含 "custom" 时激活，否则是 no-op——"按需激活"模式。
4. Pregel 超步循环在每步结束后检查激活的 stream_mode 列表，分别将对应数据推入输出 channel，实现多模式并行输出。

## 代码阅读检查

- [ ] 能在 `types.py` L120-134 中找到 StreamMode 的 Literal union 定义，说明为什么用 Literal 而非枚举
- [ ] 能在 `pregel/_messages.py` 中找到 StreamMessagesHandler，解释其如何过滤 TAG_NOSTREAM 标签的节点
- [ ] 能追踪 Pregel.stream 循环中多模式数据的分发逻辑
- [ ] 能说明 messages 模式中 metadata 包含哪些信息（节点名、命名空间），以及客户端如何利用它

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（Pregel.stream 支持多种 stream_mode + StreamMessagesHandler 实现 token 级流式）并引用 `ev-stream-mode-def-code` 和 `ev-stream-messages-handler-code`
- 引用 `ev-test-stream-values` 和 `ev-test-stream-messages` 说明 values 和 messages 模式的验证方式
- 完成 `labs/06-mini-callback-tracer/` 中的最小复刻实验（实现简化版回调 + 流式输出机制）
