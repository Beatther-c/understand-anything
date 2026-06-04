# OpenClaw Turn 执行路径追踪

基于源码和测试证据的静态追踪，未伪造本地 live provider 执行 transcript。

```text
input state
  -> AcpSessionManager.runTurn / runManagerTurn
  -> resolve session meta and backend candidate plan
  -> ensure runtime handle
  -> mark session running and active turn
  -> consumeAcpTurnStream
  -> runtime emits text/tool/thought events
  -> manager updates background task progress
  -> awaitTurnWithTimeout
  -> terminal result or failover/error cleanup
```

关键证据：

- ev-code-acp-manager
- ev-code-acp-turn
- ev-code-acp-stream
- ev-test-acp-manager
- ev-test-acp-turn-runner

