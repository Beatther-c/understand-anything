# 状态与消息：TypedDict、Reducer 与 MessagesState — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. LangGraph 用 TypedDict 定义图状态 schema，每个字段被解析为一个 Channel，控制并行写入时的合并策略。
2. `Annotated[type, reducer]` 标注的字段映射为 `BinaryOperatorAggregate` Channel（聚合语义），无标注字段使用 `LastValue` Channel（最后写入者胜）。
3. `MessagesState` 是预定义 TypedDict，其 `messages` 字段使用 `add_messages` 作为 reducer——按 ID 合并（相同 ID 覆盖、新 ID 追加、RemoveMessage 删除）。
4. `_get_channels()` 是状态解析入口，通过 `get_type_hints(schema, include_extras=True)` 提取字段注解，决定创建何种 Channel。

## 代码阅读检查

- [ ] 能在 `state.py` L1801-1859 中找到 `_get_channels` 函数，并解释其遍历 TypedDict 字段的逻辑
- [ ] 能在 `binop.py` L51-142 中找到 `BinaryOperatorAggregate.update()`，说明其逐值聚合的机制
- [ ] 能在 `graph/message.py` 中找到 `add_messages` 实现，解释按 ID 索引的三种行为（追加、覆盖、删除）
- [ ] 能说明 `LastValue` Channel 和 `BinaryOperatorAggregate` Channel 的适用场景边界
- [ ] 能解释 `_is_field_binop()` 如何判断一个字段是否需要聚合 Channel

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（Annotated → BinaryOperatorAggregate，无标注 → LastValue）并引用 `ev-get-channels-code`
- 引用 `ev-test-channels-binop` 和 `ev-test-messages-state` 说明 Channel 行为的验证方式
- 完成 `labs/02-message-types/` 中的最小复刻实验（实现简化版 Channel + reducer 机制）
