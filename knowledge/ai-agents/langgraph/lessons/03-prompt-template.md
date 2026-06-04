# 03 节点函数即提示装配层：把业务上下文变成模型输入

## 你会学到什么

- `StateGraph.add_node` 如何将普通 Python 函数注册为图节点。
- 节点函数签名 `(State) -> dict` 和 `(State, config) -> dict` 的设计意图。
- 函数名自动推断为节点名的机制（类比 Spring Bean 的按方法名注册）。
- `StateNodeSpec` 数据类如何描述节点的元信息。
- 节点函数作为"提示装配层"——从 State 取数据、组装 prompt、调用模型的模式。

## AI 概念从零解释

在 LangGraph 中，节点不是某个框架提供的复杂类——它就是一个**普通 Python 函数**。函数接收当前 State（一个 TypedDict 字典），返回一个 partial dict 表示"我要更新这些字段"。

这和 Go 的 handler 或 Java 的 `Function<State, Map>` 接口本质一样。LangGraph 的设计选择是：

- **约定大于配置**：函数名就是节点名，不需要额外注解。
- **输入输出透明**：输入是完整 State，输出是你想更新的字段子集（框架帮你 merge 回 State）。
- **无状态函数**：每个节点函数本身无状态，所有状态通过 State 传递。

为什么说它是"提示装配层"？在 Agent 场景中，节点函数的典型职责是：
1. 从 State 中提取业务上下文（用户消息、历史对话、工具结果）。
2. 拼装成 LLM 可理解的 prompt（加系统消息、格式化工具结果）。
3. 调用模型，将结果写回 State。

这层逻辑就像 Java 中的 Service 方法——编排数据、调用外部依赖、返回结果。

## 源码阅读路径

| 属性 | 值 |
|------|------|
| repo | langchain-ai/langgraph |
| commit | `83dd61feaca993d2ee428706ad04c869895ce400` |
| scope | `libs/langgraph/langgraph/graph/` |
| primary path | `libs/langgraph/langgraph/graph/state.py` |
| primary symbol | `StateGraph.add_node` |

**3 步阅读法**：
1. 从 `add_node`（`state.py` L662-913）入口开始，看第一个 `if not isinstance(node, str)` 分支如何从函数的 `__name__` 推断节点名。
2. 看 `coerce_to_runnable(action, name=node, trace=False)` 调用，理解普通函数被包装为 `RunnableCallable`。
3. 阅读 `StateNodeSpec`（`_node.py` L1-80）和节点函数的多种 Protocol 签名，理解框架支持的函数形态。

## 关键 claims 与 evidence

### claim-03-prompt-template

> StateGraph.add_node 接受普通 Python 函数作为节点，函数签名为 (State) -> dict 或 (State, config) -> dict，自动推断函数名为节点名

**证据支持**：

- **ev-add-node-impl-code**（`state.py` L662-913）：`add_node` 核心逻辑——如果第一个参数不是 string，则用 `getattr(action, "__name__")` 推断节点名。然后通过 `coerce_to_runnable` 包装为 Runnable，最终创建 `StateNodeSpec` 存入 `self.nodes` 字典。
- **ev-state-node-spec-code**（`_node.py` L1-80）：`StateNodeSpec` 定义了节点的完整规格：`runnable`（执行逻辑）、`metadata`、`input_schema`、`retry_policy`、`cache_policy` 等。同时 `_node.py` 定义了 `_Node`/`_NodeWithConfig`/`_NodeWithWriter` 等 Protocol，描述函数签名的多种合法形态。
- **ev-test-add-node-function**（`test_pregel.py` L433-462）：测试 `test_invoke_single_process_in_out` 使用普通函数作为节点，验证完整的 add_node→compile→invoke 流程。
- **ev-test-node-name-infer**（`test_pregel.py` L505-528）：测试 `test_invoke_single_process_in_out_dict` 验证函数名被正确推断为节点名。

## 相关测试证据

- **ev-test-add-node-function**（`test_pregel.py` L433-462）：定义函数 `add_one(x)`，通过 `builder.add_node(add_one)` 注册，验证 `graph.invoke({"x": 1})` 返回 `{"x": 2}`。阅读时关注：测试没有显式传节点名，说明 `add_one.__name__` 被自动使用。
- **ev-test-node-name-infer**（`test_pregel.py` L505-528）：测试使用字典形式的返回值，验证函数名即节点名的行为在不同返回格式下都一致。阅读时注意 `stream` 输出中节点名与函数名的对应关系。

## 真实源码解释

`add_node` 的设计体现了"零配置优先"理念。当你传入一个函数时，框架做三件事：

1. **推断节点名**：`node = getattr(action, "__name__", action.__class__.__name__)`。如果你传入 lambda 或没名字的 callable，会报错要求显式指定名字。
2. **包装为 Runnable**：`coerce_to_runnable(action, name=node, trace=False)` 将普通函数包装为 `RunnableCallable`，使其拥有 `invoke/ainvoke` 能力。`trace=False` 意味着节点自身不产生独立的 trace span（图级别已有 trace）。
3. **创建节点规格**：`StateNodeSpec` 记录节点的 runnable、input_schema（默认为图的 state_schema）、retry_policy 等配置。

函数签名方面，`_node.py` 定义了 9 种合法 Protocol（`_Node`、`_NodeWithConfig`、`_NodeWithWriter`、`_NodeWithStore`、`_NodeWithRuntime` 等）。框架通过 inspect 检测函数参数名来决定注入什么（config、writer、store、runtime），这和 Spring 的依赖注入类似，只是基于参数名约定。

## 自测题

请前往 `quizzes/03-prompt-template.quiz.md` 完成自测。

## 掌握度验证

请前往 `mastery/03-prompt-template.mastery.md` 完成掌握度验证。

## 最小复刻任务

请前往 `labs/03-mini-prompt-template/` 完成最小复刻任务。

## 学完标准

- 能解释 `add_node(my_func)` 内部发生的三步操作（推断名→包装 Runnable→创建 NodeSpec）。
- 能列举节点函数的至少 4 种合法签名形态及其注入参数。
- 能说明为什么节点函数返回 `dict` 而非完整 State（partial update 语义）。
- 能口述节点函数在 Agent 场景中"从 State 取数据→组装 prompt→调用模型→写回 State"的标准模式。
