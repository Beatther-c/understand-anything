# 节点函数即提示装配层 — 自测题

## 选择题

### 1. 当调用 `builder.add_node(my_func)` 时，框架如何确定节点名？

- A. 使用函数的第一个参数名
- B. 使用 `getattr(action, "__name__")` 获取函数名
- C. 自动生成 UUID 作为节点名
- D. 必须由用户显式指定

**答案**: B

> `add_node` 使用 `getattr(action, "__name__", action.__class__.__name__)` 推断节点名。如果传入 lambda 或无名 callable，会报错要求显式指定。参见 `ev-add-node-impl-code`（`state.py` L662-913）。

### 2. 节点函数的返回值语义是什么？

- A. 返回完整的新 State 替换旧 State
- B. 返回一个 partial dict，框架将其 merge 回 State（partial update）
- C. 返回 None，通过副作用修改 State
- D. 返回 Runnable 对象供下一步执行

**答案**: B

> 节点函数返回 dict 表示"我要更新这些字段"，框架负责将 partial dict merge 回完整 State。这是 partial update 语义。

### 3. add_node 内部对普通函数做了哪些处理？

- A. 推断节点名 → 包装为 RunnableCallable → 创建 StateNodeSpec
- B. 直接存入 self.nodes 字典，不做任何包装
- C. 将函数编译为字节码优化执行速度
- D. 创建线程池为该节点分配独立执行上下文

**答案**: A

> add_node 做三件事：(1) `__name__` 推断节点名，(2) `coerce_to_runnable` 包装为 RunnableCallable，(3) 创建 `StateNodeSpec` 存入 `self.nodes`。参见 `ev-add-node-impl-code`。

## 简答题

### 1. 请列举节点函数的至少 4 种合法签名形态，并说明框架如何通过 inspect 检测参数名来决定注入什么。

> 提示：`_node.py` 定义了 `_Node`、`_NodeWithConfig`、`_NodeWithWriter`、`_NodeWithStore`、`_NodeWithRuntime` 等 Protocol。参考 `ev-state-node-spec-code`（`_node.py` L1-80）。

### 2. 为什么说节点函数在 Agent 场景中充当"提示装配层"？请描述其典型职责模式（从 State 取数据→组装 prompt→调用模型→写回 State）。

> 提示：类比 Java 中的 Service 方法——编排数据、调用外部依赖、返回结果。参考 `ev-test-add-node-function`（`test_pregel.py` L433-462）中的测试用例。

## 参考答案说明

简答题没有唯一答案。回答时需要：
- 引用具体的源码路径
- 引用相关的 evidence id
- 区分"源码证明"和"课程推断"
