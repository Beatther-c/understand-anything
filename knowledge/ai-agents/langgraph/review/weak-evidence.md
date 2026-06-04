# 弱证据报告

## 已解决

- 每个核心 claim 都绑定了源码 evidence。
- 除第 1 课外，每个 claim 都至少绑定 2 个 test evidence；第 1 课也绑定了 2 个 test evidence。
- UA scan 成功运行在 `repos/langgraph/libs/langgraph`，扫描 158 个文件并生成 8 个 batch。

## 仍需诚实标注

- 本包没有运行 LangGraph 完整测试套件；验证侧重文件生成、JSON 校验、源码路径存在和课程结构校验。
- 课程主要聚焦 Python 核心、prebuilt、checkpoint、Python SDK；JS SDK 与 CLI 只作为背景，没有完整展开。
- 真实 LLM/provider 调用没有执行，agent loop transcript 来自源码和测试证据归纳，不是在线模型运行日志。
