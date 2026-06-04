# Capstone 掌握度验证

## 任务

设计并实现一个小型研究助理 Agent：

- 模型节点决定是否调用 search/summarize 工具。
- ToolNode 风格执行工具。
- 支持人工确认 interrupt。
- 保存 thread_id 对应 checkpoint。
- 提供 stream 事件用于调试。

## 通过标准

- 至少 5 个测试：正常 loop、工具错误、人工恢复、checkpoint 恢复、stream 事件。
- 设计文档引用本包至少 8 个 evidence id。
- 能说明你的实现与 LangGraph 源码相比少了哪些生产能力。
