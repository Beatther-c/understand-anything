# LangChain Learning Progress

## 当前状态

- current_level: AI Agent 工程初学者，具备后端开发基础
- current_unit: 01-runnable
- current_status: 01-runnable_feedback_integrated
- source_repo_commit: `bc5f1517cf7ac27addd4286e388228b8172b93b9`

## 已生成学习包产物

- README: done
- learning path: done
- graph json: done
- 8 lessons: complete course
- 8 quizzes: complete course
- 8 mastery tasks: complete course
- 8 mini lab specs: complete course
- capstone lab spec: complete course
- weak evidence report: done
- test evidence matrix: done
- Understand Anything UA-compatible learning graph: done
- Agent Loop compiled graph trace: done
- llm-wiki graph: done
- learner annotations feedback loop: done for `01-runnable`

## 建议学习顺序

1. 阅读 `README.md` 和 `learning-path.md`。
2. 按顺序学习 `lessons/01-runnable.md` 到 `lessons/08-provider-integration.md`。
3. 每学完一课，完成对应 quiz。
4. 每学完一课，完成 mastery 的 Level 1-5。
5. 选择性完成对应 lab；如果时间充足，最后完成 capstone。
6. 阅读 `review/test-evidence-matrix.md`，理解每节课的行为验证来自哪些测试。
7. 阅读 `review/weak-evidence.md`，理解剩余增强方向主要是 lab 训练营化和 LangGraph 二阶段学习包。

## 能解释

- `Runnable` 是统一执行协议，不只是 LLM 输入接口标准化。
- `invoke` 是单输入单输出，`batch` 是多个独立输入样本批处理，`stream` 是单输入迭代式输出。
- `RunnableSequence` 是顺序 pipeline，A 的输出传给 B，不是拼接。
- `RunnableLambda` 可以快速包装普通函数，但默认不适合真正 chunk 级 streaming。

## 仍然困惑

- 已从导出的 annotated HTML 中处理 5 条疑问：
  - `RunnableConfig` 中 callbacks、tags、metadata、max_concurrency 的含义。
  - `RunnableSequence` 是什么。
  - `batch` 的多输入和多模态的区别。
  - 默认 `stream` 与真正流式的区别。
  - `RunnableSequence.invoke` 中 `step` 的定义。

## 已沉淀笔记

- `progress/learning-annotations.json`：页面标注、AI 回答、学习笔记校正。
- `progress/personal-knowledge-notes.md`：适合在 Obsidian 阅读的个人知识笔记。

## 已完成练习

- 01-mini-runnable: pending
- 02-message-types: pending
- 03-mini-prompt-template: pending
- 04-mini-chat-model-adapter: pending
- 05-mini-tool-calling: pending
- 06-mini-callback-tracer: pending
- 07-mini-agent-loop: pending
- 08-mini-provider-adapter: pending
- 99-capstone-mini-langchain-agent: pending

## 下一步

重新阅读 `01-runnable` 已补充的小节，然后完成 `01-runnable.quiz.md` 和 `01-runnable.mastery.md` 的新增题目。
