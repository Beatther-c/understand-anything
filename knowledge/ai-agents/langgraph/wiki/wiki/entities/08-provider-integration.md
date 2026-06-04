# BaseCheckpointSaver, InMemorySaver, client.stream

生产系统需要重试、回放、时间旅行、跨请求记忆、远程运行和并发订阅；这些都要求执行状态与 API 边界可序列化。
