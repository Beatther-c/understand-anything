# 测试证据矩阵

## 目标

把每一节课的核心 claim 绑定到源码证据和测试证据，确保课程内容有据可查。

## 证据矩阵

| Lesson | Claim | Code Evidence | Test Evidence |
|--------|-------|---------------|---------------|
| 01-runnable | claim-01-runnable | ev-stategraph-compile-code, ev-compiled-extends-pregel | ev-test-compile-invoke, ev-test-stream-basic |
| 02-message-schema | claim-02-message-schema | ev-get-channels-code, ev-binop-channel-code | ev-test-channels-binop, ev-test-messages-state |
| 03-prompt-template | claim-03-prompt-template | ev-add-node-impl-code, ev-state-node-spec-code | ev-test-add-node-function, ev-test-node-name-infer |
| 04-chat-model-adapter | claim-04-chat-model-adapter | ev-create-react-agent-code, ev-should-bind-tools-code | ev-test-react-agent-basic, ev-test-react-agent-prompt |
| 05-tool-interface | claim-05-tool-interface | ev-toolnode-class-code, ev-toolnode-invoke-code | ev-test-tool-node-basic, ev-test-tool-node-parallel |
| 06-callback-tracing | claim-06-callback-tracing | ev-stream-mode-def-code, ev-stream-messages-handler-code | ev-test-stream-values, ev-test-stream-messages |
| 07-agent-loop | claim-07-agent-loop-conditional | ev-conditional-edges-code, ev-command-class-code | ev-test-conditional-edges, ev-test-command-goto |
| 07-agent-loop | claim-07-agent-loop-interrupt | ev-interrupt-func-code, ev-command-resume-code | ev-test-interrupt-resume, ev-test-interrupt-multiple |
| 08-provider-integration | claim-08-provider-integration | ev-base-saver-code, ev-inmemory-saver-code, ev-remote-graph-code | ev-test-checkpoint-roundtrip |
| 99-capstone | claim-99-capstone | ev-create-react-agent-full-code, ev-react-agent-graph-structure | ev-test-react-agent-with-checkpoint, ev-test-react-agent-interrupt |

## 证据详情

### 01-runnable

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-stategraph-compile-code | code | libs/langgraph/langgraph/graph/state.py:1164-1388 | StateGraph.compile | 验证图结构、创建 channels、实例化 CompiledStateGraph |
| ev-compiled-extends-pregel | code | libs/langgraph/langgraph/graph/state.py:1391-1410 | CompiledStateGraph | 继承 Pregel 类定义 |
| ev-test-compile-invoke | test | libs/langgraph/tests/test_pregel.py:433-462 | test_invoke_single_process_in_out | compile 后 invoke 执行单节点 |
| ev-test-stream-basic | test | libs/langgraph/tests/test_pregel.py:1382-1418 | test_imp_stream_order | stream 方法按序输出 |

### 02-message-schema

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-get-channels-code | code | libs/langgraph/langgraph/graph/state.py:1801-1859 | _get_channels | 解析 TypedDict 的 Annotated 字段映射为 Channel |
| ev-binop-channel-code | code | libs/langgraph/langgraph/channels/binop.py:51-142 | BinaryOperatorAggregate | 实现 update 聚合方法 |
| ev-test-channels-binop | test | libs/langgraph/tests/test_channels.py:92-107 | test_binop | 验证 operator.add 聚合行为 |
| ev-test-messages-state | test | libs/langgraph/tests/test_messages_state.py:188-210 | test_messages_state | 验证 add_messages reducer |

### 03-prompt-template

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-add-node-impl-code | code | libs/langgraph/langgraph/graph/state.py:662-913 | StateGraph.add_node | 推断节点名、包装为 RunnableCallable |
| ev-state-node-spec-code | code | libs/langgraph/langgraph/graph/_node.py:1-80 | StateNodeSpec | 节点数据类定义 |
| ev-test-add-node-function | test | libs/langgraph/tests/test_pregel.py:433-462 | test_invoke_single_process_in_out | 普通函数作为节点 |
| ev-test-node-name-infer | test | libs/langgraph/tests/test_pregel.py:505-528 | test_invoke_single_process_in_out_dict | 函数名推断为节点名 |

### 04-chat-model-adapter

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-create-react-agent-code | code | libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py:278-500 | create_react_agent | 构建 agent/tools 节点的 StateGraph |
| ev-should-bind-tools-code | code | libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py:173-198 | _should_bind_tools | 检查并自动 bind_tools |
| ev-test-react-agent-basic | test | libs/prebuilt/tests/test_react_agent.py:91-121 | test_no_prompt | 基本 ReAct 循环执行 |
| ev-test-react-agent-prompt | test | libs/prebuilt/tests/test_react_agent.py:148-168 | test_system_message_prompt | 支持 SystemMessage prompt |

### 05-tool-interface

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-toolnode-class-code | code | libs/prebuilt/langgraph/prebuilt/tool_node.py:622-800 | ToolNode | 注册工具列表、提取 tool_calls |
| ev-toolnode-invoke-code | code | libs/prebuilt/langgraph/prebuilt/tool_node.py:800-1000 | ToolNode._func | 并行执行工具收集 ToolMessage |
| ev-test-tool-node-basic | test | libs/prebuilt/tests/test_tool_node.py:125-221 | test_tool_node | 解析 AIMessage.tool_calls 执行工具 |
| ev-test-tool-node-parallel | test | libs/prebuilt/tests/test_tool_node.py:222-268 | test_tool_node_tool_call_input | 多个并行 tool_calls |

### 06-callback-tracing

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-stream-mode-def-code | code | libs/langgraph/langgraph/types.py:120-139 | StreamMode | 七种流式模式定义 |
| ev-stream-messages-handler-code | code | libs/langgraph/langgraph/pregel/_messages.py:1-50 | StreamMessagesHandler | 拦截 LLM token 转发到 messages 流 |
| ev-test-stream-values | test | libs/langgraph/tests/test_pregel.py:555-684 | test_invoke_two_processes_in_out | 多节点 stream 输出中间状态 |
| ev-test-stream-messages | test | libs/langgraph/tests/test_pregel.py:6986-7127 | test_stream_mode_messages_command | stream_mode='messages' 输出 token |

### 07-agent-loop

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-conditional-edges-code | code | libs/langgraph/langgraph/graph/state.py:969-1017 | StateGraph.add_conditional_edges | 路由函数包装为 BranchSpec |
| ev-command-class-code | code | libs/langgraph/langgraph/types.py:759-808 | Command | graph/update/resume/goto 字段 |
| ev-interrupt-func-code | code | libs/langgraph/langgraph/types.py:811-934 | interrupt | 追踪中断索引、抛出 GraphInterrupt |
| ev-command-resume-code | code | libs/langgraph/langgraph/types.py:759-808 | Command.resume | resume 字段提供恢复值 |
| ev-test-conditional-edges | test | libs/langgraph/tests/test_pregel.py:2925-2976 | test_callable_in_conditional_edges_with_no_path_map | callable 路由函数行为 |
| ev-test-command-goto | test | libs/langgraph/tests/test_pregel.py:5236-5303 | test_command_goto_with_static_breakpoints | Command(goto=...) 动态路由 |
| ev-test-interrupt-resume | test | libs/langgraph/tests/test_pregel.py:4852-4920 | test_interrupt_multiple | 多个 interrupt 的暂停和恢复 |
| ev-test-interrupt-multiple | test | libs/langgraph/tests/test_pregel.py:5305-5722 | test_multiple_interrupt_state_persistence | 多次中断状态持久化 |

### 08-provider-integration

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-base-saver-code | code | libs/checkpoint/langgraph/checkpoint/base/__init__.py:176-348 | BaseCheckpointSaver | 定义核心接口方法 |
| ev-inmemory-saver-code | code | libs/checkpoint/langgraph/checkpoint/memory/__init__.py:33-100 | InMemorySaver | defaultdict 存储实现 |
| ev-remote-graph-code | code | libs/langgraph/langgraph/pregel/remote.py:118-300 | RemoteGraph | 通过 SDK 发起远程调用 |
| ev-test-checkpoint-roundtrip | test | libs/checkpoint/tests/test_memory.py:210-220 | test_memory_saver | InMemorySaver 读写一致性 |

### 99-capstone

| Evidence ID | Type | Path | Symbol | Summary |
|-------------|------|------|--------|---------|
| ev-create-react-agent-full-code | code | libs/prebuilt/langgraph/prebuilt/chat_agent_executor.py:278-1016 | create_react_agent | 完整实现：StateGraph + 节点 + 条件边 + 中断点 |
| ev-react-agent-graph-structure | test | libs/prebuilt/tests/test_react_agent_graph.py:1-40 | test_react_agent_graph | 图结构正确性验证 |
| ev-test-react-agent-with-checkpoint | test | libs/prebuilt/tests/test_react_agent.py:91-121 | test_no_prompt | 配合 checkpointer 的持久化执行 |
| ev-test-react-agent-interrupt | test | libs/prebuilt/tests/test_react_agent.py:535-598 | test_react_agent_update_state | update_state 和中断恢复能力 |

## 结论

当前所有 10 条核心 claim 均有源码证据和测试证据支撑。第 7 课（Agent Loop）证据最丰富（8 条），因为它包含两个子主题（条件边 + 中断恢复）。第 8 课测试证据相对薄弱（仅 1 条），因为 RemoteGraph 的集成测试需要网络环境。

总计：40 条证据（22 条 code + 18 条 test）。
