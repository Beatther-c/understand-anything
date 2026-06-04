# AI Agent 代码学习知识库方案

日期：2026-06-01

## 1. 背景与目标

这个知识库的目标不是收集 AI Agent 领域资料，也不是做一个泛泛的源码分析站点，而是帮助学习者通过真实开源项目的代码，系统理解 AI Agent 工程中的核心概念、实现模式和设计取舍。

目标用户画像：

- 有约 4 年 Java 后端开发经验。
- 熟悉接口、抽象类、设计模式、服务编排、异步任务、测试等工程概念。
- 使用过 AI 工具，但不默认理解 LLM / Agent 应用开发中的常识。
- 希望通过代码系统学习 AI Agent 领域，而不是只阅读理论文章。

因此，这套知识库的教学风格应当是：

- 编程和工程抽象不用从零讲。
- AI / LLM / Agent 概念按小白解释。
- 源码阅读要循序渐进，但允许信息密度较高。
- 每个结论都尽量绑定源码、测试或文档证据。
- 学习结果通过多种方式验证，包括 quiz、源码追踪、概念复述、图谱重建、对比分析、故障诊断、改造任务、最小复刻和 capstone 项目。

最终产物不是一堆散文式笔记，而是一个可编译、可查询、可验证、可复用的学习包。

## 2. 核心理念

### 2.1 从“知识库”变成“知识编译系统”

传统知识库通常是人工写 Markdown 页面。这里更合适的方式是把源码阅读过程设计成一条知识编译流水线：

```text
源码仓库
  -> 代码图谱
  -> AI 研究包
  -> 实体 / 关系 / 断言 / 证据抽取
  -> 课程化 Wiki 页面
  -> Quiz / Lab / Capstone
  -> 弱证据报告
  -> 学习者阅读与练习
```

也就是说：

- Markdown 页面是给人读的展示产物。
- JSON 图谱是给 AI、检索、可视化和后续编译使用的结构化产物。
- Quiz 和 Lab 是用来验证学习者是否真的理解的训练产物。

### 2.2 学习者不是审核专家

学习者最开始并不具备判断 AI 生成内容是否完全正确的能力，所以流程不应要求学习者扮演源码专家或最终审核者。

更合理的分工是：

- AI 研究员负责读源码、生成候选知识。
- AI 编译器负责抽取实体、关系、断言和证据。
- AI 验证员负责检查证据强弱、标记低置信度内容。
- 学习者负责阅读、提问、做题、复刻和标记疑惑。

审核不主要依赖学习者的专家判断，而依赖以下机制：

- 每个核心 claim 绑定 evidence。
- 每个 claim 标记 evidence level 和 confidence。
- 自动生成 weak-evidence 报告。
- 通过 quiz、复述题和源码追踪题检查概念理解。
- 通过 lab、改造任务、故障诊断和 capstone 检查工程理解。

## 3. 工具分工

### 3.1 Understand Anything

`Understand Anything` 在这套流程中不作为最终知识库，而作为代码图谱生成器和源码阅读导航器。

项目地址：

```text
https://github.com/Lum1104/Understand-Anything/tree/main
```

主要职责：

- 扫描代码仓库。
- 提取文件、模块、类、函数、依赖、调用关系。
- 生成可交互代码图谱。
- 帮助定位核心源码入口和阅读路径。
- 作为 AI 研究包的输入之一。

推荐使用方式：

```text
源码项目
  -> /understand 生成代码图谱
  -> /understand-dashboard 辅助探索
  -> /understand-chat 追问核心抽象、调用链、关键文件
```

对于大型 monorepo，不建议第一次直接分析整个仓库，应先按目录分阶段分析。

### 3.2 Markdown-first 知识库

长期沉淀建议使用 Markdown-first 方案，而不是一开始使用重型知识库系统。

原因：

- Git 友好。
- AI 读写方便。
- 易于静态发布。
- 易于迁移。
- 易于和 Obsidian、Logseq、MkDocs、Docusaurus、llm-wiki 等工具结合。

### 3.3 llm-wiki-skill

`llm-wiki-skill` 可以作为知识编译层的基础工具，负责把研究材料编译成类似 Karpathy llm-wiki 的结构化知识库。

项目地址：

```text
https://github.com/sdyckjq-lab/llm-wiki-skill
```

它适合复用的能力：

- 根据素材生成结构化 Wiki。
- 抽取实体页、主题页、素材摘要和双向链接。
- 生成可本地浏览的知识图谱。
- 标记置信度，例如 `EXTRACTED`、`INFERRED`、`AMBIGUOUS`、`UNVERIFIED`。
- 支持 Markdown-first、本地文件、Obsidian 兼容和多平台 agent 使用。

需要注意的是，`llm-wiki-skill` 原始设计里的 `raw/` 更偏向文章、网页、PDF、对话和笔记等原始素材。对于本项目，`raw/` 不应该直接等同于源码仓库，而应放入调用知识编译流程前已经产生的研究材料，例如：

```text
raw/
  code-graph/
    understand-anything-graph.json
    understand-anything-summary.md
  research-packs/
    01-runnable.research.md
    02-message-schema.research.md
  source-notes/
    runnable-source-paths.md
    tool-interface-source-paths.md
```

因此，本项目更适合把 `llm-wiki-skill` 改造成或包装成一个“代码学习知识编译器”：

```text
源码仓库
  -> Understand Anything 生成代码图谱
  -> AI 生成 research pack
  -> research pack 进入 llm-wiki raw/
  -> llm-wiki-skill 抽取 entities / topics / links / confidence
  -> 本项目补充 claims / evidence / lessons / labs / quizzes
```

也就是说：

- `Understand Anything` 负责从源码到代码图谱。
- `llm-wiki-skill` 负责从研究材料到 Wiki 图谱。
- 本项目流程负责把 Wiki 图谱进一步课程化，并补上 evidence、quiz、lab、capstone 和学习进度。

### 3.4 知识编译与图谱

知识编译层负责把研究材料转成结构化图谱：

- entities.json
- relations.json
- claims.json
- evidence.json
- learning-map.json

这些文件是后续 Wiki 页面、图谱可视化、AI 检索和学习路径生成的基础。

## 4. 工具调用流程与产物落点

本项目不要求学习者手工创建完整目录。更合适的方式是把目录视为工具调用后的产物：先生成源码图谱，再生成研究包，再走 llm-wiki 风格的知识编译，最后补齐课程化学习材料。

### 4.1 准备源码仓库

建议把外部源码放在 `repos/` 下，和知识库产物分开：

```bash
mkdir -p repos
git clone https://github.com/langchain-ai/langchain.git repos/langchain
```

如果仓库已经存在，则更新到当前分支最新状态：

```bash
git -C repos/langchain pull --ff-only
```

### 4.2 调用 Understand Anything 生成代码图谱

在 Codex / agent 环境中，优先使用已安装的 `understand` skill：

```text
/understand repos/langchain/libs/core --language zh
```

首次学习 LangChain 时不要直接扫描整个 monorepo，建议按范围逐步生成：

```text
/understand repos/langchain/libs/core --language zh
/understand repos/langchain/libs/langchain_v1 --language zh
/understand repos/langchain/libs/langchain --language zh
/understand repos/langchain/libs/partners/openai --language zh
```

Understand Anything 的主要产物位于被分析目录对应的 `.understand-anything/` 下，关键文件是：

```text
.understand-anything/knowledge-graph.json
.understand-anything/meta.json
.understand-anything/config.json
```

在本项目学习包中，需要把关键图谱产物复制或摘要到：

```text
knowledge/ai-agents/langchain/raw/code-graph/
```

示例：

```bash
mkdir -p knowledge/ai-agents/langchain/raw/code-graph
cp repos/langchain/libs/core/.understand-anything/knowledge-graph.json \
  knowledge/ai-agents/langchain/raw/code-graph/libs-core.knowledge-graph.json
```

### 4.3 生成 research pack

research pack 是连接“代码图谱”和“知识编译”的中间材料。它不是最终课程页面，而是给 llm-wiki-skill 和后续 AI 编译器读取的结构化研究素材。

每个学习单元生成一个 research pack：

```text
knowledge/ai-agents/langchain/raw/research-packs/
  01-runnable.research.md
  02-message-schema.research.md
  ...
```

research pack 至少包含：

- 学习单元目标。
- 相关源码路径。
- 核心 symbol。
- 初步实体。
- 初步关系。
- 候选 claims。
- 证据引用。
- 不确定问题。

### 4.4 调用 llm-wiki-skill 做知识编译

如果要初始化一个通用 llm-wiki 知识库，可以直接调用安装好的脚本：

```bash
bash /Users/chenkun/.codex/skills/llm-wiki/scripts/init-wiki.sh \
  "/Users/chenkun/Documents/understand-anything/knowledge/ai-agents/langchain/wiki" \
  "LangChain Agent Engineering Learning Pack"
```

本项目的特殊点是：`raw/` 目录不是直接放源码，而是放第 4.2 和 4.3 步生成的代码图谱摘要、research pack 和 source notes。后续可以使用 llm-wiki-skill 的 ingest 思路，把这些中间材料编译为：

```text
knowledge/ai-agents/langchain/wiki/entities/
knowledge/ai-agents/langchain/wiki/topics/
knowledge/ai-agents/langchain/wiki/sources/
```

实际使用 `llm-wiki-skill` 的初始化脚本时，项目根目录是 `knowledge/ai-agents/langchain/wiki/`，可发布内容会放在它内部的 `wiki/` 子目录。因此落盘路径通常是：

```text
knowledge/ai-agents/langchain/wiki/wiki/entities/
knowledge/ai-agents/langchain/wiki/wiki/topics/
knowledge/ai-agents/langchain/wiki/wiki/sources/
knowledge/ai-agents/langchain/wiki/wiki/graph-data.json
knowledge/ai-agents/langchain/wiki/wiki/knowledge-graph.html
```

现阶段不强行把 llm-wiki-skill 原始目录结构当作唯一目录结构，而是复用它的能力和方法论：

- 实体抽取。
- 主题抽取。
- 双向链接。
- 置信度标记。
- 本地 Markdown-first。
- 图谱生成。

### 4.5 生成课程化学习包

在代码图谱和 wiki 图谱之后，再生成课程化学习包：

```text
knowledge/ai-agents/langchain/
  README.md
  learning-path.md
  graph/
  raw/
  wiki/
  lessons/
  quizzes/
  mastery/
  labs/
  review/
  progress/
```

其中 `wiki/` 偏 llm-wiki 风格知识图谱，`lessons/`、`quizzes/`、`mastery/`、`labs/` 偏学习路径和掌握度验证。两者可以互相链接，但职责不同。

## 5. 知识图谱数据模型

### 5.1 Entity

Entity 是知识图谱里的节点，可以是源码符号、概念、模式或产物。

示例：

```json
{
  "id": "langchain.runnable",
  "name": "Runnable",
  "type": "source_symbol",
  "domain": "ai-agents",
  "project": "langchain",
  "description": "LangChain 中用于统一可执行组件的核心抽象。",
  "source_refs": [
    {
      "repo": "langchain-ai/langchain",
      "path": "libs/core/...",
      "symbol": "Runnable"
    }
  ]
}
```

常见 entity 类型：

- `source_symbol`
- `concept`
- `pattern`
- `module`
- `workflow`
- `lesson`
- `lab`

### 5.2 Relation

Relation 表示实体之间的关系。

示例：

```json
{
  "from": "langchain.runnable_sequence",
  "to": "langchain.runnable",
  "type": "composes",
  "description": "RunnableSequence 用于组合多个 Runnable。",
  "evidence_ids": ["ev-langchain-runnable-sequence-001"]
}
```

常见 relation 类型：

- `implements`
- `extends`
- `composes`
- `calls`
- `adapts`
- `emits`
- `depends_on`
- `explained_by`
- `tested_by`

### 5.3 Claim

Claim 是可验证的知识断言，是知识库可靠性的核心。

示例：

```json
{
  "id": "claim-langchain-runnable-unifies-components",
  "text": "LangChain 使用 Runnable 作为 prompt、model、parser、retriever 等组件的统一执行抽象。",
  "lesson": "01-runnable",
  "confidence": "high",
  "evidence_level": "code",
  "evidence_ids": [
    "ev-langchain-runnable-001",
    "ev-langchain-runnable-sequence-001"
  ],
  "status": "generated"
}
```

`evidence_level` 可选值：

- `code`：源码直接支持。
- `test`：测试直接支持。
- `docs`：官方文档支持。
- `inferred`：AI 根据结构推断，必须谨慎阅读。

`confidence` 可选值：

- `high`
- `medium`
- `low`

### 5.4 Evidence

Evidence 是 claim 的证据。

示例：

```json
{
  "id": "ev-langchain-runnable-001",
  "repo": "langchain-ai/langchain",
  "commit": "unknown",
  "path": "libs/core/...",
  "symbol": "Runnable",
  "evidence_type": "code",
  "summary": "该符号定义了统一执行接口和相关组合能力。",
  "line_range": null
}
```

后续实际运行时，应尽量补充 commit hash 和 line range。

## 6. LangChain 学习包范围

### 6.1 研究对象

目标仓库：

```text
https://github.com/langchain-ai/langchain
```

建议优先范围：

```text
libs/core
libs/langchain
libs/langchain_v1
libs/partners/openai
standard-tests
```

优先级：

1. `libs/core`
2. `libs/langchain_v1`
3. `libs/langchain`
4. `libs/partners/openai`
5. `standard-tests`

### 6.2 学习包主题

这个学习包的主题不是“LangChain 使用教程”，而是：

```text
LangChain 如何把 LLM 应用组件标准化、组合化，并为 Agent 框架提供底层抽象。
```

需要注意边界：

- LangChain：组件抽象和组合层。
- LangGraph：复杂 Agent workflow / 状态机编排层。
- LangSmith：观测、调试和评估层。
- Deep Agents：更高层 agent 能力封装。

## 7. 八个学习单元

### 7.1 Runnable

AI 概念：

- LLM 应用为什么需要把 prompt、model、parser、retriever、tool 串成 pipeline。
- 为什么单纯函数调用不足以表达 stream、batch、async 等执行形态。

工程重点：

- 统一执行接口。
- 组合模式。
- `invoke`、`stream`、`batch`、async 变体。
- RunnableSequence / RunnableLambda 等实现。

学习目标：

- 能解释 Runnable 解决的问题。
- 能说明它和 Java 中函数式组合、FilterChain、HandlerAdapter 的相似与不同。
- 能实现一个 MiniRunnable。

### 7.2 Message Schema

AI 概念：

- LLM 为什么使用 messages，而不是普通字符串。
- system / human / ai / tool message 分别表达什么。
- tool result 为什么需要作为消息回填。

工程重点：

- 消息类型建模。
- 对话状态表示。
- provider 输入输出格式归一化。
- ToolMessage 与 tool calling 的关系。

学习目标：

- 能解释 message schema 对 Agent loop 的价值。
- 能区分不同 message role。
- 能实现一组简化 message 类型。

### 7.3 Prompt Template

AI 概念：

- Prompt 为什么需要结构化。
- 变量、模板、partial binding 和格式化的意义。
- Prompt 和普通字符串拼接的差异。

工程重点：

- 模板渲染。
- 输入变量校验。
- Prompt 和 Runnable 的组合。
- PromptTemplate / ChatPromptTemplate 的抽象。

学习目标：

- 能解释 prompt template 在大型 LLM 应用中的必要性。
- 能实现一个 MiniPromptTemplate。

### 7.4 ChatModel Adapter

AI 概念：

- 不同模型 provider 的 API、输入格式、输出格式为什么不同。
- 为什么需要统一 ChatModel 接口。
- streaming、tool call、token usage 等字段为什么会造成适配复杂度。

工程重点：

- 抽象基类。
- provider adapter。
- 输入输出规范化。
- 同步、异步、流式调用。

学习目标：

- 能解释 adapter 层如何屏蔽 provider 差异。
- 能实现一个 mock chat model adapter。

### 7.5 Tool Interface

AI 概念：

- 什么是 tool calling / function calling。
- 模型并不真的直接调用函数，它只是生成结构化调用意图。
- tool schema、参数校验、执行结果回填的意义。

工程重点：

- Tool 定义。
- 参数 schema。
- 调用分发。
- 错误处理。
- ToolMessage 回填。

学习目标：

- 能解释 tool calling 的完整闭环。
- 能实现一个 mini tool calling loop。

### 7.6 Callback / Tracing

AI 概念：

- LLM 应用为什么需要观测每一步。
- 为什么只看最终输出不够。
- tracing、callback、run lifecycle 的作用。

工程重点：

- 生命周期事件。
- CallbackManager。
- 事件分发。
- 链路追踪。
- 调试和评估所需的数据结构。

学习目标：

- 能解释 callback/tracing 对复杂 Agent 的价值。
- 能实现一个 mini callback tracer。

### 7.7 Agent Loop

AI 概念：

- Agent 如何从“模型一次输出”变成“思考、行动、观察、继续决策”的循环。
- stopping condition、tool result、memory/context 在 loop 里的作用。

工程重点：

- 循环控制。
- 模型决策。
- 工具执行。
- 结果回填。
- 错误恢复。
- 最大轮数和停止条件。

学习目标：

- 能解释一个最小 Agent loop。
- 能把 Runnable、Message、Tool、ChatModel 串起来。

### 7.8 Provider Integration

AI 概念：

- provider、model、API、token、streaming、tool call 格式的差异。
- 为什么同一个 Agent 框架需要多个 provider adapter。

工程重点：

- OpenAI / Anthropic 等 provider 接入模式。
- 兼容层。
- 错误与重试。
- 标准测试。
- API 变更对框架抽象的影响。

学习目标：

- 能解释 provider integration 的工程复杂度。
- 能实现一个 mock provider 和一个真实 provider adapter 的接口设计。

## 8. Lesson 页面模板

每个 lesson 应按固定结构生成，避免 AI 自由发挥导致内容风格不稳定。

```md
# 05 Tool Interface

## 你会学到什么

本课的学习目标，用 3-5 条说明。

## AI 概念从零解释

解释本课涉及的 AI / LLM / Agent 基础概念，不默认读者理解这些术语。

## 为什么工程上需要这个抽象

从后端工程和系统设计角度解释问题。

## 最小心智模型

用伪代码、小图或 20 行左右的简化代码建立直觉。

## LangChain 源码入口

- repo:
- commit:
- path:
- symbol:
- related tests:

## 源码阅读路径

1. 先看哪个文件。
2. 再看哪个类或函数。
3. 最后看哪些测试或典型调用点。

## 核心实体和关系

列出本课关键 entity 和 relation。

## 关键 claims 与 evidence

每条 claim 必须有 evidence id、evidence level 和 confidence。

## 真实源码解释

解释核心源码如何实现本课概念。

## 设计取舍

说明为什么这样设计，它带来什么收益和成本。

## 和 Java 后端经验类比

用读者已有经验建立连接，但不要强行类比。

## 容易误解的点

列出 AI Agent 初学者容易误解的内容。

## 自测题

概念题、源码题、设计题混合。

## 掌握度验证

包含复述、源码追踪、图谱重建、对比分析、故障诊断和微改造任务。

## 最小复刻任务

定义一个可完成、可运行、可测试的 mini lab。

## 学完标准

说明学完后应能解释什么、实现什么、判断什么。
```

## 9. 掌握度验证设计

掌握一个知识点不应只靠做选择题或读完一篇 lesson 来判断。更好的方式是设计一组从浅到深的验证任务，让学习者逐步证明自己“看懂了、能解释、能定位、能改造、能迁移”。

每个单元建议包含以下验证方式：

1. 概念复述：用自己的话解释本单元核心概念，不允许照抄 lesson 原文。
2. 源码定位：给出一个行为问题，让学习者在源码里找到入口、核心 symbol 和测试。
3. 调用链追踪：从一个公开 API 或典型用法追到内部实现，画出 3-7 个关键节点。
4. 图谱重建：不看答案，手写本单元的核心 entity 和 relation。
5. 对比解释：把 LangChain 的实现与 Java 后端经验或另一个 Agent 框架做对比。
6. 反向讲解：假设给另一个开发者讲 5 分钟，写出讲解提纲。
7. 故障诊断：给一个错误行为或异常日志，判断可能出在哪个抽象层。
8. 微改造任务：对 mini lab 增加一个小功能，例如支持 streaming、错误回调或新 provider。
9. 迁移设计：说明如果把这个模式放进自己的 Agent harness，接口应如何设计。
10. Capstone 集成：把多个单元组合成一个可以运行的最小 Agent。

这些任务可以写入：

```text
mastery/
  01-runnable.mastery.md
  02-message-schema.mastery.md
  ...
```

示例：

```md
# 01 Runnable Mastery

## Level 1: 复述

不用看笔记，用 150 字解释 Runnable 解决了什么问题。

## Level 2: 源码定位

找到 Runnable、RunnableSequence、RunnableLambda 的定义位置，并说明三者关系。

## Level 3: 调用链追踪

从一个 `prompt | model | parser` 风格的组合用法开始，追踪到实际执行顺序。

## Level 4: 图谱重建

画出 Runnable、RunnableSequence、RunnableConfig、invoke、stream、batch 的关系。

## Level 5: 微改造

在 `01-mini-runnable` 中增加一个 `with_config` 能力，并说明它和 LangChain 设计的差异。
```

## 10. Quiz 设计

Quiz 不是考试，而是学习反馈工具。

每个单元建议包含：

- 3-5 道概念题。
- 2-3 道源码理解题。
- 1-2 道设计取舍题。
- 1 道迁移应用题。

示例：

```md
# 01 Runnable Quiz

## 概念题

1. 为什么 LangChain 需要 Runnable，而不是只用普通函数？
2. invoke、stream、batch 分别适合什么场景？

## 源码题

1. 找到 RunnableSequence 的组合逻辑，说明它如何把前一个 Runnable 的输出传给下一个 Runnable。

## 设计题

1. 如果你要在 Java 里实现类似 Runnable 的抽象，你会如何设计接口？

## 迁移题

1. 如果你在自己的 Agent harness 中引入 Runnable 思路，它会解决什么问题？会带来什么复杂度？
```

## 11. Lab 设计

每个 lab 应该是小而完整的复刻任务，不追求功能全面，追求验证理解。

八个基础 lab：

1. `01-mini-runnable`
2. `02-message-types`
3. `03-mini-prompt-template`
4. `04-mini-chat-model-adapter`
5. `05-mini-tool-calling`
6. `06-mini-callback-tracer`
7. `07-mini-agent-loop`
8. `08-mini-provider-adapter`

最终 capstone：

```text
99-capstone-mini-langchain-agent
```

Capstone 目标：

- 实现 Runnable 接口。
- 实现 Message 类型。
- 实现 PromptTemplate。
- 实现 ChatModel adapter。
- 实现 Tool schema 和 tool calling。
- 实现 Callback tracer。
- 实现 Agent loop。
- 至少包含一个 mock provider。
- 可选支持一个真实 provider adapter。

## 12. AI 生成流水线

一次性生成完整学习包时，推荐流程：

```text
1. 克隆目标仓库
2. 确定源码范围
3. 用 Understand Anything 生成代码图谱
4. AI 基于代码图谱生成 raw/research-packs
5. 使用 llm-wiki-skill 或其改造版本抽取实体、主题、链接和置信度
6. AI 生成全局项目地图
7. AI 生成 learning-map.json
8. AI 按八个单元抽取 entities / relations / claims / evidence
9. AI 生成 lessons
10. AI 生成 quizzes
11. AI 生成 mastery tasks
12. AI 生成 labs
13. AI 生成 capstone
14. AI verifier 生成 weak-evidence.md 和 ai-verification-report.md
15. 学习者开始阅读、做题、复刻和记录疑惑
```

这条流水线应尽量自动化。学习者主要提供：

- 目标仓库。
- 学习范围。
- 目标读者画像。
- 希望生成的学习单元。
- 是否需要真实 provider adapter。

## 13. 弱证据报告

为了避免 AI 生成看似正确但缺少证据的内容，每个学习包必须生成：

```text
review/weak-evidence.md
```

内容包括：

- 只有文档证据、没有源码证据的 claim。
- 只有 inferred 证据的 claim。
- 找不到明确测试支撑的行为。
- 可能因为仓库结构复杂而遗漏的范围。
- 需要后续人工或 AI 进一步追问的问题。

示例：

```md
# Weak Evidence Report

## Low Confidence Claims

- claim: Agent loop in libs/langchain_v1 follows pattern X.
  reason: 当前只基于目录结构和局部调用推断，缺少完整调用链证据。
  next_action: 追踪入口函数到 tool execution 的完整路径。

## Docs-only Claims

- claim: Runnable is intended as universal execution abstraction.
  reason: README / docs 支持，但需要源码 symbol 和测试进一步绑定。
```

学习者阅读时优先信任：

```text
code high
test high
docs medium
inferred low
```

## 14. 学习进度记录

学习者不需要审核全部内容，但需要记录自己的理解状态。

建议文件：

```text
progress/learning-progress.md
```

模板：

```md
# LangChain Learning Progress

## 当前状态

- current_level: AI Agent 工程初学者
- current_unit: 01-runnable

## 已学习

- Runnable: studied
- Message Schema: not_started

## 能解释

- Runnable 为什么统一 invoke / stream / batch。

## 仍然困惑

- stream 和 transform 的关系。
- RunnableConfig 的具体作用。

## 已完成练习

- 01-mini-runnable: pending

## 掌握度验证

- 01-runnable mastery level: L2
- 已完成：复述、源码定位
- 未完成：调用链追踪、微改造

## 下一步

- 完成 01-mini-runnable。
- 回答 01-runnable.quiz.md。
- 完成 01-runnable.mastery.md 的 Level 3。
```

## 15. 生成完整学习包的提示词模板

后续可以直接使用或改造下面的提示词。

```text
请基于 langchain-ai/langchain 生成一个完整的 LangChain Agent Engineering Learning Pack。

目标读者：
- 有 4 年 Java 后端开发经验
- 熟悉接口、抽象类、设计模式、异步任务、服务编排、测试
- 使用过 AI 工具
- 但对 LLM / Agent 应用开发中的常识不做默认假设
- AI 概念按小白解释，工程实现可以适度深入

源码范围：
- libs/core
- libs/langchain
- libs/langchain_v1
- 必要时参考 libs/partners/openai
- 必要时参考 standard-tests

学习单元：
1. Runnable
2. Message Schema
3. Prompt Template
4. ChatModel Adapter
5. Tool Interface
6. Callback / Tracing
7. Agent Loop
8. Provider Integration

输出目录：
knowledge/ai-agents/langchain/

必须生成：
- README.md
- learning-path.md
- raw/code-graph/*
- raw/research-packs/*.research.md
- raw/source-notes/*.md
- graph/entities.json
- graph/relations.json
- graph/claims.json
- graph/evidence.json
- graph/learning-map.json
- lessons/01-runnable.md
- lessons/02-message-schema.md
- lessons/03-prompt-template.md
- lessons/04-chat-model-adapter.md
- lessons/05-tool-interface.md
- lessons/06-callback-tracing.md
- lessons/07-agent-loop.md
- lessons/08-provider-integration.md
- quizzes/*.quiz.md
- mastery/*.mastery.md
- labs/*/README.md
- review/weak-evidence.md
- review/ai-verification-report.md
- progress/learning-progress.md

生成要求：
- 使用 Understand Anything 生成代码图谱；项目地址为 https://github.com/Lum1104/Understand-Anything/tree/main。
- 使用 llm-wiki-skill 或其改造版本从 raw/research-packs 中抽取实体、主题、链接和置信度；项目地址为 https://github.com/sdyckjq-lab/llm-wiki-skill。
- raw/ 目录中的内容是调用知识编译流程前已经生成的研究材料，不直接把源码仓库当作 raw/ 内容。
- 每个单元先解释 AI 概念，再解释 LangChain 源码实现。
- 不写编程零基础内容。
- 不跳过 AI 领域基本概念。
- 每个核心 claim 必须带 evidence_level 和 confidence。
- evidence 优先使用源码和测试，文档只能作为辅助。
- inferred 内容必须明确标记。
- 每个 lesson 都要包含源码阅读路径、关键实体、关键关系、设计取舍、Java 后端经验类比、容易误解的点、自测题和最小复刻任务。
- 每个单元都要生成掌握度验证任务，至少包含复述、源码定位、调用链追踪、图谱重建、对比解释、故障诊断、微改造和迁移设计。
- 最后生成一个 capstone mini agent 项目说明，把八个单元串起来。
```

## 16. 后续可优化方向

### 16.1 从单仓库扩展到多仓库对比

当 LangChain 学习包完成后，可以用同样结构研究：

- LangGraph
- OpenAI Agents SDK
- CrewAI
- AutoGen / Microsoft Agent Framework
- Pydantic AI
- Smolagents
- OpenHands
- browser-use

然后在 `patterns/` 层沉淀跨项目模式：

- Agent loop
- Tool calling
- Workflow graph
- Memory / context management
- Guardrails
- Skill system
- Sandbox
- Human-in-the-loop
- Callback / tracing
- Provider adapter

### 16.2 增加跨项目 Pattern Atlas

当多个项目都有学习包后，可以生成：

```text
knowledge/ai-agents/patterns/
  agent-loop.md
  tool-calling.md
  workflow-graph.md
  skill-system.md
  provider-adapter.md
```

每个 pattern 页面比较不同项目的实现：

```text
LangChain 如何做
LangGraph 如何做
OpenAI Agents SDK 如何做
Smolagents 如何做
OpenHands 如何做
可迁移经验是什么
什么时候不要这样做
```

### 16.3 增加可视化

可视化不应替代内容，但可以帮助学习者导航：

- 单元依赖图。
- Entity graph。
- Claim evidence graph。
- 源码调用链图。
- Pattern across projects 图。

### 16.4 增加学习反馈回路

后续可以让系统根据学习者 quiz 和 lab 的结果自动更新：

- 哪些单元需要重学。
- 哪些概念需要补充解释。
- 哪些 lab 需要拆小。
- 哪些 AI 生成解释不够清楚。

## 17. 当前建议的下一步

建议先不要同时研究多个仓库。第一阶段只做：

```text
LangChain Agent Engineering Learning Pack
```

最小可行版本：

- 先生成完整目录结构。
- 先跑 `libs/core` 的代码图谱。
- 一次性生成八个 lesson 的初稿。
- 每个 lesson 至少有 3-5 个 high confidence claims。
- 生成 weak-evidence.md。
- 生成每个单元的 mastery 任务。
- 生成 8 个 lab 的 README，而不是马上实现全部代码。
- 生成 capstone 说明。

完成后，学习者先阅读：

1. `README.md`
2. `learning-path.md`
3. `lessons/01-runnable.md`
4. `mastery/01-runnable.mastery.md`
5. `review/weak-evidence.md`

如果这个学习体验成立，再扩展到完整源码范围和其他 Agent 项目。
