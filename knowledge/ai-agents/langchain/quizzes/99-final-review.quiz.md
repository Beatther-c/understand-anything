# 99 Final Review Quiz

## 跨单元概念题

1. 用一张流程图解释 `PromptTemplate -> ChatModel -> AIMessage.tool_calls -> BaseTool -> ToolMessage -> ChatModel`。
2. Runnable、Message、Prompt、ChatModel、Tool、Callback、Agent Loop、Provider Adapter 分别解决哪一层问题？
3. 哪些抽象属于“统一执行协议”，哪些属于“模型输入输出协议”，哪些属于“外部能力接入”？

## 跨单元源码题

1. 从 `prompt | model` 开始，列出你会阅读哪些源码文件来追踪一次调用。
2. 从 `AIMessage.tool_calls` 开始，列出你会阅读哪些源码文件来追踪一次工具调用。
3. 从 `ChatOpenAI.bind_tools` 开始，说明工具 schema 如何从 LangChain 对象进入 OpenAI payload。

## 系统设计题

1. 如果你自己做一个 Agent harness，哪些抽象必须先做，哪些可以后做？
2. 你会如何设计最小 tracing，使它足以 debug tool calling？
3. 如果要支持多个 provider，你会把差异放在 ChatModel adapter、Tool 层，还是 Agent loop？

## Capstone 准备题

1. 画出 `99-capstone-mini-langchain-agent` 的模块图。
2. 为每个模块写 2 个必须通过的测试。
3. 写出你认为最容易出 bug 的 5 个边界情况。

