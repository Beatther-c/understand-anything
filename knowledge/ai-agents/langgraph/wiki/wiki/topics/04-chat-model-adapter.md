# 模型适配：把 ChatModel 当成图节点的一部分

模型不是全局魔法；它是节点调用链里的一个可替换组件。节点根据状态调用模型，模型返回 AIMessage 或工具调用请求。

主要 evidence: ev-react-call-model-code, ev-tool-binding-code, ev-test-dynamic-model, ev-test-model-tool-mismatch。
