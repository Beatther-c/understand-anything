# 节点函数即提示装配层：把业务上下文变成模型输入

LangGraph 不把 prompt 固定成特殊类；节点函数负责读取状态、上下文和历史消息，决定下一次模型调用的输入。

主要 evidence: ev-runtime-code, ev-react-prompt-code, ev-test-react-prompt, ev-test-runtime-context。
