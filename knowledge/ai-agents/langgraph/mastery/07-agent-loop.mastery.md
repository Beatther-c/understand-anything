# Agent Loop：条件边、Command、interrupt 与 ReAct 循环 — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. `add_conditional_edges(source, router_fn)` 将路由函数包装为 BranchSpec，节点完成后框架调用该函数决定下一步。路由函数返回列表可实现扇出。
2. Command 是复合控制原语，包含 graph/update/resume/goto 四个字段——把状态更新和路由控制合并为原子操作，还支持子图向父图的跨层通信。
3. `interrupt()` 通过中断计数器追踪索引，未找到 resume 值则抛出 GraphInterrupt 暂停。恢复时节点从头 replay，interrupt() 直接返回 resume 值。节点代码必须幂等。
4. Send 在条件边中实现 map-reduce 动态扇出：`[Send("node", input1), Send("node", input2)]` 创建同一节点的多个并行实例。

## 代码阅读检查

- [ ] 能在 `state.py` L969-1017 中找到 `add_conditional_edges` 的实现，说明 BranchSpec 的创建逻辑
- [ ] 能在 `types.py` L759-808 中找到 Command 数据类定义，解释 `_update_as_tuples` 如何将 update 转为 Channel 写入格式
- [ ] 能在 `types.py` L811-934 中追踪 `interrupt()` 的三段式逻辑（已有 resume → 返回，新 resume → 消费，无 resume → 抛异常）
- [ ] 能画出 ReAct 循环的完整图结构：START → agent → tools_condition → tools/END → agent（循环）
- [ ] 能解释 `Command.PARENT` 如何实现子图到父图的跨层通信

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（条件边 + Command 路由 + interrupt 暂停恢复）并引用 `ev-conditional-edges-code` 和 `ev-interrupt-func-code`
- 引用 `ev-test-interrupt-resume` 和 `ev-test-interrupt-multiple` 说明中断恢复和多 interrupt 场景的验证方式
- 完成 `labs/07-mini-agent-loop/` 中的最小复刻实验（实现简化版条件边 + interrupt/resume 机制）
