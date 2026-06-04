# 节点函数即提示装配层 — 掌握度检查

## 口头讲解

不看课程，向同事清晰讲出以下要点：

1. `add_node` 接受普通 Python 函数，内部做三步：推断函数名为节点名 → `coerce_to_runnable` 包装为 RunnableCallable → 创建 `StateNodeSpec` 存入 `self.nodes`。
2. 节点函数签名为 `(State) -> dict`（或带 config/writer/store/runtime 参数的变体），返回 partial dict 表示"要更新哪些字段"。
3. 框架通过 inspect 检测参数名决定注入什么（config、writer、store、runtime），类似 Spring 的依赖注入。
4. 在 Agent 场景中，节点函数充当"提示装配层"：从 State 取数据 → 组装 prompt → 调用模型 → 将结果写回 State。

## 代码阅读检查

- [ ] 能在 `state.py` L662-913 中找到 `add_node` 的实现，指出节点名推断的具体代码行
- [ ] 能在 `_node.py` L1-80 中找到 `StateNodeSpec` 定义和至少 4 种函数签名 Protocol
- [ ] 能解释 `coerce_to_runnable(action, name=node, trace=False)` 中 `trace=False` 的设计意图
- [ ] 能说明为什么节点函数返回 partial dict 而非完整 State（与 reducer/Channel 的配合关系）

## 通过标准

你已掌握本课程，如果你能：
- 解释核心 claim（add_node 接受函数、推断名、包装 Runnable）并引用 `ev-add-node-impl-code`
- 引用 `ev-test-add-node-function` 和 `ev-test-node-name-infer` 说明函数注册和名称推断的验证方式
- 完成 `labs/03-mini-prompt-template/` 中的最小复刻实验（实现简化版 add_node + 函数名推断）
