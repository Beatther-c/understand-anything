# CallbackManager

<!-- confidence: EXTRACTED -->

`CallbackManager` 是 LangChain Core 的 callback / tracing 事件分发入口，源码位于 `libs/core/langchain_core/callbacks/manager.py:1343`。

## 关联

- 属于主题：[[callback-tracing]]
- 由 [[runnable-config]] 挂载到运行过程

## 证据

- `manager.py:1343`：定义 `CallbackManager`。
- `manager.py:1346`：定义 `on_llm_start`。
- `manager.py:1397`：定义 `on_chat_model_start`。
- `manager.py:1451`：定义 `on_chain_start`。

