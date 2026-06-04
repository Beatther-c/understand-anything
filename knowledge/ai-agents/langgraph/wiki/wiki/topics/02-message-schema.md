# 状态与消息：TypedDict、Reducer 与 MessagesState

状态不是一个普通 dict；每个字段可以有合并规则。消息字段通常用 reducer 追加、覆盖或按 id 更新。

主要 evidence: ev-messages-state-code, ev-add-messages-code, ev-test-messages-state, ev-test-channels-overwrite。
