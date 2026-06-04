# MessagesState, add_messages, Overwrite

多节点并发写入时必须有确定性合并策略，否则同一 super-step 的两个节点会把状态写乱。
