# 流式输出、调试事件与追踪 — 自测题

## 选择题

### 1. LangGraph 的 StreamMode 一共支持多少种模式？

- A. 3 种（values/updates/messages）
- B. 5 种（values/updates/messages/custom/debug）
- C. 7 种（values/updates/messages/custom/checkpoints/tasks/debug）
- D. 2 种（values/messages）

**答案**: C

> StreamMode 使用 Literal union 定义了 7 种模式：values、updates、messages、custom、checkpoints、tasks、debug。参见 `ev-stream-mode-def-code`（`types.py` L120-139）。

### 2. StreamMessagesHandler 通过什么机制实现 token 级流式输出？

- A. 轮询 LLM 的输出缓冲区
- B. 继承 BaseCallbackHandler，拦截 `on_llm_new_token` 事件并转发到输出流
- C. 在 LLM 调用前预设输出缓冲区大小
- D. 使用 WebSocket 连接 LLM 服务器

**答案**: B

> StreamMessagesHandler 继承 BaseCallbackHandler，实现回调协议，当 LLM 产生新 token 时包装为 `(message_chunk, metadata)` 元组推入输出流。参见 `ev-stream-messages-handler-code`。

### 3. 当 stream_mode 不包含 "custom" 时，节点中注入的 StreamWriter 有什么行为？

- A. 抛出 NotImplementedError
- B. 是 no-op（无操作），调用不报错但不产生输出
- C. 自动切换到 "values" 模式输出
- D. 将数据写入日志文件

**答案**: B

> 当 stream_mode 不包含 "custom" 时，writer 是 no-op（`Callable[[Any], None]`）——节点代码不需要知道外部是否在监听。这是"按需激活"模式。

## 简答题

### 1. 请分别说明 values 模式和 updates 模式的数据粒度差异，以及它们各自适用的业务场景。

> 提示：values = 每步结束后的完整 state snapshot；updates = 增量 diff（只包含本步修改的字段）。参考 `ev-test-stream-values`（`test_pregel.py` L555-684）。

### 2. TAG_NOSTREAM 和 TAG_HIDDEN 如何控制节点输出的可见性？请举例说明在什么场景下需要隐藏特定节点的 messages 流输出。

> 提示：隐藏内部处理节点（如工具执行节点）的 LLM 输出，前端只需看到最终 agent 节点的回复。参考课程中节点过滤与 TAG 的描述。

### 3. 如果你需要同时满足"前端实时展示打字效果"和"后端监控任务执行进度"两种需求，应该如何组合 stream_mode？请解释你的选择。

> 提示：前端用 `["messages"]`，后端用 `["updates", "tasks"]`。多种模式可组合，框架独立输出。参考 `ev-stream-mode-def-code`。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
