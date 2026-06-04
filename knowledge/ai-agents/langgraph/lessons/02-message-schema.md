# 02 状态与消息：TypedDict、Reducer 与 MessagesState

## 你会学到什么

- LangGraph 如何用 Python TypedDict 定义图状态 schema。
- `Annotated[type, reducer]` 如何将字段映射为 `BinaryOperatorAggregate` Channel。
- 无注解字段默认使用 `LastValue` Channel（"最后写入者胜"）。
- `MessagesState` 和 `add_messages` reducer 的设计思想。
- 类比 Java/Go 中 Event Sourcing 的 reducer/fold 概念。

## AI 概念从零解释

在 workflow 引擎中，"状态"是所有节点共享的上下文。问题是：当多个节点并行写入同一字段时，如何合并？LangGraph 的答案是 **Channel + Reducer** 模式：

- **LastValue Channel**：只保留最后写入的值，类似 Java `AtomicReference.set()`。适用于"只有一个节点写"的字段。
- **BinaryOperatorAggregate Channel**：每次写入时，用你指定的二元操作符（如 `operator.add`、列表拼接）聚合新值和旧值。类似 Kafka Streams 的 `reduce()`。

这和 Redux 的 reducer 概念一样：`newState = reducer(oldState, action)`。在 LangGraph 里，`Annotated[list[Message], add_messages]` 就是在说"这个字段的 reducer 是 `add_messages` 函数"。

**`MessagesState`** 是 LangGraph 预定义的 TypedDict，包含一个用 `add_messages` 作为 reducer 的 `messages` 字段。`add_messages` 按消息 ID 合并（相同 ID 覆盖，新 ID 追加），支持 `RemoveMessage` 删除——这和 CRDT（Conflict-free Replicated Data Type）的思路类似。

## 源码阅读路径

| 属性 | 值 |
|------|------|
| repo | langchain-ai/langgraph |
| commit | `83dd61feaca993d2ee428706ad04c869895ce400` |
| scope | `libs/langgraph/langgraph/channels/` + `libs/langgraph/langgraph/graph/` |
| primary path | `libs/langgraph/langgraph/channels/binop.py` |
| primary symbol | `BinaryOperatorAggregate` |

**3 步阅读法**：
1. 从 `_get_channels()`（`state.py` L1801-1859）开始，看 TypedDict 字段如何被解析为不同 Channel 类型。
2. 阅读 `BinaryOperatorAggregate`（`binop.py` L51-142），理解其 `update()` 方法如何逐一应用 operator 聚合值。
3. 看 `MessagesState`（`graph/message.py` L372-373）和 `add_messages`（L60-244）的实现，理解消息合并策略。

## 关键 claims 与 evidence

### claim-02-message-schema

> TypedDict 中使用 Annotated[type, reducer] 标注的字段会被解析为 BinaryOperatorAggregate Channel，未标注字段使用 LastValue Channel

**证据支持**：

- **ev-get-channels-code**（`state.py` L1801-1859）：`_get_channels` 函数遍历 TypedDict 的 `type_hints`，对每个字段调用 `_get_channel`。如果字段是 `Annotated[type, binop]` 则创建 `BinaryOperatorAggregate`，否则 fallback 到 `LastValue`。
- **ev-binop-channel-code**（`binop.py` L51-142）：`BinaryOperatorAggregate.update()` 接收 `values: Sequence[Value]`，对每个值执行 `self.value = self.operator(self.value, value)` 完成聚合。
- **ev-test-channels-binop**（`test_channels.py` L92-107）：测试 `test_binop` 使用 `operator.add` 验证 `BinaryOperatorAggregate` 正确聚合多个整数值。
- **ev-test-messages-state**（`test_messages_state.py` L188-210）：测试验证 `MessagesState` 的 `add_messages` reducer 正确管理消息列表的追加和按 ID 覆盖。

## 相关测试证据

- **ev-test-channels-binop**（`test_channels.py` L92-107）：创建一个 `BinaryOperatorAggregate(int, operator.add)` 实例，分别 update `[1]`、`[2, 3]`，验证累加结果为 6。阅读时重点看 `update()` 被调用后 `get()` 返回的累计值如何变化。
- **ev-test-messages-state**（`test_messages_state.py` L188-210）：构建一个使用 `MessagesState` 的简单图，验证多轮消息写入后 `messages` 字段正确追加而非覆盖。阅读时关注 `add_messages` 的 ID 合并逻辑。

## 真实源码解释

`_get_channels` 是整个状态解析的入口。它通过 `get_type_hints(schema, include_extras=True)` 提取 TypedDict 每个字段的类型注解。对于 `Annotated[list[Message], add_messages]` 这样的字段，`_is_field_binop()` 检测到第二个元素是 callable，就创建 `BinaryOperatorAggregate(list, add_messages)`。

`BinaryOperatorAggregate` 的核心在 `update()` 方法：如果当前值为 MISSING（未初始化），直接取第一个值；之后逐个应用 `self.operator(self.value, value)`。它还支持 `Overwrite` 语义——某些情况下你需要强制覆盖而非聚合。

`add_messages` 函数并不是简单的 `list.extend`。它按 ID 建立索引：如果新消息 ID 已存在则覆盖，`RemoveMessage` 则删除对应 ID 的消息。这让消息管理有了"编辑"和"撤回"的能力，而不仅仅是追加。

## 自测题

请前往 `quizzes/02-message-schema.quiz.md` 完成自测。

## 掌握度验证

请前往 `mastery/02-message-schema.mastery.md` 完成掌握度验证。

## 最小复刻任务

请前往 `labs/02-message-types/` 完成最小复刻任务。

## 学完标准

- 能解释 `Annotated[list, add_messages]` 在编译阶段如何被解析为 `BinaryOperatorAggregate` Channel。
- 能说出 `LastValue` 和 `BinaryOperatorAggregate` 的行为差异及各自适用场景。
- 能描述 `add_messages` 的三种行为：追加新消息、按 ID 覆盖、RemoveMessage 删除。
- 能手写一个自定义 reducer 函数并用 `Annotated` 绑定到 TypedDict 字段。
- 能解释为什么并行节点写入需要 reducer 而非简单覆盖。
