# 状态与消息：TypedDict、Reducer 与 MessagesState — 自测题

## 选择题

### 1. 在 TypedDict 中，未使用 Annotated 标注的字段默认使用什么 Channel 类型？

- A. BinaryOperatorAggregate Channel
- B. LastValue Channel
- C. EphemeralValue Channel
- D. DynamicBarrierValue Channel

**答案**: B

> `_get_channels` 函数对无注解字段 fallback 到 `LastValue` Channel（"最后写入者胜"语义）。参见 `ev-get-channels-code`（`state.py` L1801-1859）。

### 2. add_messages reducer 的行为不包括以下哪项？

- A. 追加新消息到列表
- B. 按消息 ID 覆盖已有消息
- C. 通过 RemoveMessage 删除对应 ID 的消息
- D. 自动对消息列表去重（基于内容相同）

**答案**: D

> `add_messages` 按 ID 做索引管理：相同 ID 覆盖、新 ID 追加、RemoveMessage 删除。它不做基于内容的去重。参见课程中对 `add_messages`（`graph/message.py` L60-244）的描述。

### 3. BinaryOperatorAggregate 的 update() 方法如何处理多个值？

- A. 只保留最后一个值
- B. 对每个值逐一执行 `self.operator(self.value, value)` 聚合
- C. 将所有值放入列表返回
- D. 计算所有值的平均值

**答案**: B

> `BinaryOperatorAggregate.update()` 对 values 序列中的每个值执行 `self.value = self.operator(self.value, value)` 完成聚合。参见 `ev-binop-channel-code`（`binop.py` L51-142）。

## 简答题

### 1. 请解释为什么并行节点写入同一字段时需要 reducer，而不能简单使用"最后写入者胜"策略？

> 提示：考虑并行超步中多个节点同时写入的场景。参考 `ev-binop-channel-code` 和 `ev-get-channels-code` 理解 Channel 设计。

### 2. 请描述 `Annotated[list[Message], add_messages]` 在编译阶段如何被解析为 `BinaryOperatorAggregate` Channel，并说明解析入口函数。

> 提示：从 `_get_channels()`（`state.py` L1801-1859）出发，追踪 `_is_field_binop()` 的检测逻辑。参考 `ev-get-channels-code`。

### 3. MessagesState 的 `add_messages` 被描述为类似 CRDT（Conflict-free Replicated Data Type）。请解释这个类比的合理性——它支持哪三种操作？为什么这比简单的 list.extend 更强大？

> 提示：按 ID 索引管理（追加、覆盖、删除），支持"编辑"和"撤回"能力。参考 `ev-test-messages-state`。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
