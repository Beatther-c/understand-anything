# Test Evidence Matrix

## 目标

把每一节课的核心 claim 绑定到测试证据，避免课程只停留在源码解释。

## 覆盖情况

| Lesson | 测试证据 | 覆盖行为 |
| --- | --- | --- |
| 01 Runnable | `ev-test-batch-concurrency` | batch 并发、Runnable 执行语义 |
| 02 Message Schema | `ev-test-message-tool-call-serde`, `ev-test-message-chunk-tool-calls`, `ev-test-tool-message-serde-dict` | message 序列化、tool call chunk 合并、ToolMessage 字段保真 |
| 03 Prompt Template | `ev-test-prompt-from-template`, `ev-test-prompt-partial-validation`, `ev-test-chat-prompt-formatting`, `ev-test-chat-prompt-invoke` | 变量推断、partial binding、输入校验、message 输出 |
| 04 ChatModel Adapter | `ev-test-chat-model-batch-tracing`, `ev-test-chat-model-stream-fallback`, `ev-test-fake-chat-model-modes` | invoke/batch/stream/async 统一接口、tracing、fallback |
| 05 Tool Interface | `ev-test-tool-structured-args`, `ev-test-structured-tool-schema`, `ev-test-tool-call-to-tool-message`, `ev-test-tool-schema-dict` | schema 推断、ToolCall 输入、ToolMessage 输出、dict schema |
| 06 Callback / Tracing | `ev-test-callback-manager-merge`, `ev-test-async-callback-dispatch`, `ev-test-tracer-nested-run`, `ev-test-tracer-usage-metadata` | handler 合并、事件分发、parent_run_id、usage metadata |
| 07 Agent Loop | `ev-test-agent-create-agent-tool-runtime`, `ev-test-agent-middleware-tools-node` | compiled graph 执行、tool runtime 注入、middleware tools node |
| 08 Provider Integration | `ev-test-openai-responses-tool-call-conversion`, `ev-test-openai-bind-tools-responses`, `ev-test-openai-custom-tool` | OpenAI Responses API 转换、bind_tools、custom tool |

## 结论

当前 02-08 已不再是“主要源码证据、缺少测试证据”的状态。每节课至少有 2 条测试证据；Prompt、Tool、Callback 单元有 4 条测试证据。

后续如果继续增强，可以为每节课增加 integration test 和最小 lab test，但这已经不属于弱证据修复，而是训练营化工程。
