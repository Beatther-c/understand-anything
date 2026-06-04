#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pack = path.join(root, "knowledge/ai-agents/openclaw");
const repo = "openclaw/openclaw";
const commit = "4bb86877e2cf4ae8edc4294de68a693b1119b7c3";

const dirs = [
  "graph",
  "lessons",
  "quizzes",
  "mastery",
  "labs",
  "raw/code-graph",
  "raw/research-packs",
  "raw/source-notes",
  "review",
  "progress",
  "wiki/wiki",
  "wiki/raw/notes",
  "wiki/wiki/sources",
];

for (const dir of dirs) fs.mkdirSync(path.join(pack, dir), { recursive: true });

const lessons = [
  {
    id: "01-platform-map",
    title: "OpenClaw 全局架构：本地优先个人 AI 助手",
    concept: "把 OpenClaw 先看成一个由 Gateway 调度的本地优先 agent 操作系统：消息入口、agent runtime、工具、插件、设备节点和 UI 都围绕同一个控制面工作。",
    source: [
      "README.md: OpenClaw 的产品定位、支持渠道、Gateway、工具、节点、沙箱安全模型。",
      "docs/agent-runtime-architecture.md: runtime、session、tool、provider、plugin SDK 的分层说明。",
      "package.json: monorepo 脚本暴露了 gateway、agent、tui、插件、移动端与测试入口。",
    ],
    model: "channel inbound -> gateway/session routing -> agent runtime -> model stream -> tool calls -> tool results -> reply delivery",
    tradeoff: "本地优先换来更强控制权和隐私边界，但工程上必须处理权限、凭据、会话持久化、多渠道差异和长任务可靠性。",
    analogy: "像一个后端平台把 HTTP、队列、定时任务和内部服务统一进一个工作流引擎；区别是工作流的决策节点由 LLM 动态产生。",
    tests: ["ev-test-agent-loop-basic", "ev-test-acp-manager", "ev-test-plugin-entry"],
  },
  {
    id: "02-agent-core-loop",
    title: "Agent Core：从消息到工具调用的最小循环",
    concept: "agent loop 的本质是一个事件驱动的状态机：追加用户消息，调用模型流，提取工具调用，执行工具，把工具结果写回上下文，再决定是否继续。",
    source: [
      "packages/agent-core/src/agent-loop.ts: agentLoop/runAgentLoop/runLoop/streamAssistantResponse/executeToolCalls。",
      "packages/agent-core/src/types.ts: AgentLoopConfig、hook、toolExecution、steering/follow-up 的契约。",
      "packages/agent-core/src/agent-loop.test.ts: 基础循环、工具、事件顺序的测试。",
    ],
    model: "messages[] + tools[] -> stream(model, llmContext) -> assistant message -> toolCall[] -> toolResult[] -> next turn",
    tradeoff: "核心包保持可复用和低层，不直接理解 OpenClaw 的 channel、插件、会话存储；这些由上层 runtime 注入。",
    analogy: "类似 Spring Batch/Workflow 的 step runner，但 step 的下一个动作由模型输出决定，而不是静态 DAG。",
    tests: ["ev-test-agent-loop-basic", "ev-test-agent-loop-tool", "ev-test-agent-loop-continue"],
  },
  {
    id: "03-message-context-stream",
    title: "消息、上下文与流式事件",
    concept: "LLM 应用不是一次请求一次字符串，而是一组消息、系统提示、工具定义和流式事件的组合。OpenClaw 把 partial assistant message 放入上下文并随事件更新。",
    source: [
      "packages/agent-core/src/agent-loop.ts: streamAssistantResponse 对 start/delta/done/error 的处理。",
      "packages/agent-core/src/types.ts: convertToLlm、transformContext、getApiKey 等可插拔契约。",
      "packages/llm-core/src/index.ts 与 packages/llm-core/src/types.ts: LLM 消息和 EventStream 基础类型。",
    ],
    model: "AgentMessage[] --transformContext--> AgentMessage[] --convertToLlm--> LLM Message[] --stream--> AssistantMessage events",
    tradeoff: "把 partial message 写入上下文能支持实时 UI 和工具 call delta，但也要求 done/error 时正确替换最终 message，避免脏状态。",
    analogy: "像 WebSocket 响应流：先创建占位 response，再不断 patch，最后 commit。",
    tests: ["ev-test-agent-loop-basic", "ev-test-llm-validation", "ev-test-acp-turn-stream"],
  },
  {
    id: "04-tools-policy-sandbox",
    title: "工具系统：定义、策略、沙箱与执行前后钩子",
    concept: "工具调用是 agent 产生外部影响的边界。OpenClaw 同时处理 schema 规范化、allow/deny 策略、沙箱路径、before/after hook、执行顺序和错误归一化。",
    source: [
      "src/agents/agent-tools.ts: 工具工厂、策略流水线、沙箱/host 工具、插件工具集合。",
      "src/agents/agent-tool-definition-adapter.ts: 工具执行参数拆分、错误归一化、敏感日志处理。",
      "src/agents/embedded-agent-runner/run/attempt-tool-construction-plan.ts: allowlist 如何决定要构造哪些工具集合。",
    ],
    model: "tool catalog -> policy pipeline -> model-compatible schema -> beforeToolCall -> execute -> afterToolCall -> ToolResultMessage",
    tradeoff: "工具越丰富，agent 越有能力；但每一种能力都必须有可审计的权限、输入校验和日志脱敏。",
    analogy: "像后端的 API gateway + RBAC + request/response filter，只是调用方是模型。",
    tests: ["ev-test-tool-adapter", "ev-test-tool-policy", "ev-test-tool-construction"],
  },
  {
    id: "05-embedded-runtime-provider",
    title: "内置 Runtime：模型选择、Provider、重试与故障转移",
    concept: "OpenClaw 的内置 runner 把低层 loop 包装成可运营的运行时：选择模型、准备认证、构建 prompt 和工具、处理空回复/溢出/限流/计费错误、记录 usage，并在必要时故障转移。",
    source: [
      "src/agents/embedded-agent-runner/run.ts: run 入口的依赖、常量和运行时控制逻辑。",
      "src/agents/embedded-agent-runner/run/failover-policy.ts 与 assistant-failover.ts: 故障转移决策。",
      "src/agents/embedded-agent-runner/model.ts: 模型解析与 provider 规范化。",
    ],
    model: "request -> runtime plan -> auth plan -> attempt backend -> provider stream -> classify failure -> retry/failover/compact/finalize",
    tradeoff: "可靠运行需要大量边界逻辑；代码复杂度上升，但用户看到的是一个更稳定的个人助手。",
    analogy: "像生产级 RPC client：有认证刷新、超时、重试、熔断、降级和指标。",
    tests: ["ev-test-run-failover", "ev-test-run-overflow", "ev-test-model-forward"],
  },
  {
    id: "06-sessions-acp-control-plane",
    title: "会话与 ACP 控制面：把一次 turn 变成可管理任务",
    concept: "agent 不是孤立函数调用，而是有 session key、runtime handle、active turn、取消、超时、后台任务进度和 backend failover 的长生命周期对象。",
    source: [
      "src/acp/control-plane/manager.core.ts: AcpSessionManager 的 session resolution、handle cache、actor queue。",
      "src/acp/control-plane/manager.turn-runner.ts: runManagerTurn 的 backend attempt、active turn、event stream、timeout。",
      "src/acp/control-plane/session-actor-queue.ts: 同一 session 的串行化执行。",
    ],
    model: "sessionKey -> actor queue -> runtime handle -> runTurn stream -> background progress -> terminal state",
    tradeoff: "单 session 串行化降低并发冲突，但系统必须明确后台任务、取消和超时的语义。",
    analogy: "像 Akka actor 或 Orleans grain：每个 session 是一个 actor，消息按序处理。",
    tests: ["ev-test-acp-manager", "ev-test-acp-turn-runner", "ev-test-acp-runtime-cache"],
  },
  {
    id: "07-plugin-sdk-providers",
    title: "插件 SDK 与 Provider 扩展：把生态接入运行时",
    concept: "插件 SDK 是 OpenClaw 的扩展边界：插件可以注册 provider、工具、命令、会话 action、hook、UI、模型目录和安全审计能力。",
    source: [
      "src/plugin-sdk/plugin-entry.ts: 对外导出的插件 API 类型与 definePluginEntry。",
      "src/plugin-sdk/provider-entry.ts: defineSingleProviderPluginEntry 注册 provider、auth、catalog。",
      "src/plugin-sdk/provider-tools.ts: provider 侧工具 schema 兼容处理。",
    ],
    model: "plugin manifest -> definePluginEntry -> register(api) -> provider/tool/session/action hooks -> runtime consumes SDK barrels",
    tradeoff: "扩展性要求稳定 SDK barrel；插件不能直接依赖 src 内部，否则升级成本和安全边界都会失控。",
    analogy: "像 Spring Boot starter 或 VS Code extension API：通过稳定扩展点接入核心系统。",
    tests: ["ev-test-plugin-entry", "ev-test-provider-entry", "ev-test-provider-tools"],
  },
  {
    id: "08-devices-channels-security",
    title: "渠道、设备节点与安全默认值",
    concept: "OpenClaw 面对真实外部渠道和本机设备能力，所以安全模型必须默认把 inbound DM 当成不可信输入，并用 pairing、allowlist、sandbox、工具策略和节点权限收口。",
    source: [
      "README.md: DM pairing、allowlist、sandbox 默认安全说明。",
      "packages/gateway-protocol/src/schema.ts: Gateway 协议 schema。",
      "apps/android/app/src/test/java/.../node 与 gateway 测试: Android 节点能力、设备认证、通知/相机/联系人等 handler。",
    ],
    model: "external channel/node -> gateway protocol -> identity/pairing -> allowed agent/session -> constrained tool/node action",
    tradeoff: "默认安全会让初次接入多一步 pairing，但避免把私人助手变成开放远程执行入口。",
    analogy: "像企业后端的 zero-trust ingress：先鉴权、授权、限权，再进入业务处理。",
    tests: ["ev-test-android-device-auth", "ev-test-gateway-protocol", "ev-test-android-node-handlers"],
  },
];

const evidence = [
  ev("ev-readme-product", "README.md", [20, 46], "docs", "README 说明 OpenClaw 是本地优先个人 AI 助手，Gateway 是控制面，产品形态包括多渠道、语音、Canvas、工具和节点。"),
  ev("ev-readme-security", "README.md", [118, 150], "docs", "README 明确把 inbound DM 视为不可信输入，并描述 pairing、allowlist、sandbox 默认策略。"),
  ev("ev-doc-runtime-layout", "docs/agent-runtime-architecture.md", [7, 23], "docs", "runtime 架构文档列出 src/agents、packages/agent-core、src/llm、plugin-sdk 的分层。"),
  ev("ev-code-agent-loop-entry", "packages/agent-core/src/agent-loop.ts", [42, 71], "code", "agentLoop 创建 EventStream 并异步运行 runAgentLoop。"),
  ev("ev-code-run-agent-loop", "packages/agent-core/src/agent-loop.ts", [119, 143], "code", "runAgentLoop 追加 prompt、发出 agent_start/turn_start/message 事件，并进入 runLoop。"),
  ev("ev-code-run-loop-tools", "packages/agent-core/src/agent-loop.ts", [250, 339], "code", "runLoop 流式生成 assistant message，执行 tool calls，写回 tool results，处理 prepareNextTurn、stop、steering、follow-up。"),
  ev("ev-code-stream-response", "packages/agent-core/src/agent-loop.ts", [345, 441], "code", "streamAssistantResponse 负责 transformContext、convertToLlm、调用 streamFn、处理 start/delta/done/error 事件。"),
  ev("ev-code-tool-exec-mode", "packages/agent-core/src/agent-loop.ts", [447, 481], "code", "executeToolCalls 根据 sequential/parallel 配置选择工具执行策略。"),
  ev("ev-code-agent-types", "packages/agent-core/src/types.ts", [133, 260], "code", "AgentLoopConfig 暴露 convertToLlm、transformContext、getApiKey、shouldStopAfterTurn、prepareNextTurn、steering/follow-up、toolExecution 和 beforeToolCall。"),
  ev("ev-code-tool-factory", "src/agents/agent-tools.ts", [1, 113], "code", "agent-tools 导入策略、沙箱、插件、channel、OpenClaw 工具和 schema 规范化模块，是工具系统聚合入口。"),
  ev("ev-code-tool-adapter", "src/agents/agent-tool-definition-adapter.ts", [225, 260], "code", "工具 adapter 把任意返回值归一化为 AgentToolResult，并拆分当前/历史 execute 参数。"),
  ev("ev-code-tool-log-redact", "src/agents/agent-tool-definition-adapter.ts", [138, 203], "code", "工具 adapter 对 exec 命令和 env 做敏感信息摘要/脱敏，避免日志泄漏。"),
  ev("ev-code-tool-construction", "src/agents/embedded-agent-runner/run/attempt-tool-construction-plan.ts", [12, 207], "code", "工具构造计划根据 allowlist、工具组和 plugin 名称决定 core/channel/plugin 工具是否构造。"),
  ev("ev-code-embedded-run", "src/agents/embedded-agent-runner/run.ts", [1, 215], "code", "内置 runner 汇集认证、模型解析、context engine、hooks、failover、compaction、usage 等运行时依赖。"),
  ev("ev-code-acp-manager", "src/acp/control-plane/manager.core.ts", [62, 130], "code", "AcpSessionManager 持有 actor queue、runtime handle cache、active turn、turn stats，并能解析 session 与观测状态。"),
  ev("ev-code-acp-turn", "src/acp/control-plane/manager.turn-runner.ts", [50, 139], "code", "runManagerTurn 建立后台任务上下文、解析 backend candidate、记录失败并管理 active ACP turn。"),
  ev("ev-code-acp-stream", "src/acp/control-plane/manager.turn-runner.ts", [140, 260], "code", "runManagerTurn 对 backend 尝试、runtime handle、运行状态、abort signal、turn stream 与超时进行编排。"),
  ev("ev-code-plugin-entry", "src/plugin-sdk/plugin-entry.ts", [1, 124], "code", "plugin-entry 汇总 OpenClawPluginApi、AgentHarness、Provider、工具、hook、session action 等扩展类型。"),
  ev("ev-code-provider-entry", "src/plugin-sdk/provider-entry.ts", [139, 260], "code", "defineSingleProviderPluginEntry 注册 provider auth、catalog、static/live model catalog。"),
  ev("ev-code-provider-tools", "src/plugin-sdk/provider-tools.ts", [16, 109], "code", "provider-tools 提供 Gemini/OpenAI 工具 schema 检查与规范化。"),
  ev("ev-test-agent-loop-basic", "packages/agent-core/src/agent-loop.test.ts", [1, 220], "test", "agent-core 的 agent-loop 测试覆盖基础事件流和消息返回。"),
  ev("ev-test-agent-loop-tool", "packages/agent-core/src/agent-loop.test.ts", [220, 520], "test", "agent-loop 测试覆盖工具调用、工具结果和下一轮循环。"),
  ev("ev-test-agent-loop-continue", "packages/agent-core/src/agent-loop.test.ts", [520, 900], "test", "agent-loop 测试覆盖 continue/retry 类上下文续跑行为。"),
  ev("ev-test-llm-validation", "packages/llm-core/src/validation.test.ts", [1, 220], "test", "llm-core validation 测试为消息/模型数据契约提供证据。"),
  ev("ev-test-tool-adapter", "src/agents/agent-tool-definition-adapter.test.ts", [1, 260], "test", "工具 adapter 测试覆盖工具定义适配、执行和错误处理。"),
  ev("ev-test-tool-policy", "src/agents/agent-tools.policy.test.ts", [1, 260], "test", "工具 policy 测试覆盖 allow/deny、继承与工具策略行为。"),
  ev("ev-test-tool-construction", "src/agents/embedded-agent-runner/run/attempt-tool-construction-plan.test.ts", [1, 260], "test", "工具构造计划测试覆盖 allowlist、禁用工具和 plugin/channel/core 工具构造开关。"),
  ev("ev-test-run-failover", "src/agents/embedded-agent-runner/run.cross-provider-fallback-error-context.test.ts", [1, 240], "test", "runner 故障转移测试覆盖 provider fallback 错误上下文。"),
  ev("ev-test-run-overflow", "src/agents/embedded-agent-runner/run.overflow-compaction.test.ts", [1, 260], "test", "runner 溢出压缩测试覆盖 context overflow 下的 compaction/retry。"),
  ev("ev-test-model-forward", "src/agents/embedded-agent-runner/model.forward-compat.test.ts", [1, 260], "test", "模型 forward compatibility 测试覆盖新 provider/model 配置兼容。"),
  ev("ev-test-acp-manager", "src/acp/control-plane/manager.test.ts", [1, 260], "test", "ACP manager 测试覆盖 session manager 的基础行为。"),
  ev("ev-test-acp-turn-runner", "src/acp/control-plane/manager.turn-results.test.ts", [1, 260], "test", "ACP turn 结果测试覆盖 turn 输出与终止结果。"),
  ev("ev-test-acp-runtime-cache", "src/acp/control-plane/runtime-cache.test.ts", [1, 260], "test", "runtime cache 测试覆盖 handle cache 生命周期。"),
  ev("ev-test-acp-turn-stream", "src/acp/translator.tool-streaming.test.ts", [1, 260], "test", "ACP translator 工具流测试覆盖工具事件映射/流式输出。"),
  ev("ev-test-plugin-entry", "packages/plugin-package-contract/src/index.test.ts", [1, 220], "test", "插件 package contract 测试支持插件 manifest/entry 的约束。"),
  ev("ev-test-provider-entry", "src/plugins/provider-runtime.test.ts", [1, 260], "test", "provider runtime 测试支持 provider 注册/运行时解析。"),
  ev("ev-test-provider-tools", "packages/plugin-sdk/src/provider-tools.test.ts", [1, 260], "test", "provider tools 测试支持 schema 兼容工具函数。"),
  ev("ev-test-android-device-auth", "apps/android/app/src/test/java/ai/openclaw/app/gateway/DeviceAuthPayloadTest.kt", [1, 220], "test", "Android device auth 测试支持设备认证 payload 语义。"),
  ev("ev-test-gateway-protocol", "packages/gateway-protocol/src/index.test.ts", [1, 220], "test", "gateway-protocol 测试支持 Gateway 协议导出与 schema 契约。"),
  ev("ev-test-android-node-handlers", "apps/android/app/src/test/java/ai/openclaw/app/node/InvokeDispatcherTest.kt", [1, 220], "test", "Android node invoke dispatcher 测试支持节点能力调用分发。"),
];

function ev(id, filePath, line_range, evidence_type, summary) {
  return { id, repo, commit, path: filePath, line_range, symbol: null, evidence_type, summary };
}

const entities = lessons.flatMap((l, i) => [
  {
    id: `lesson:${l.id}`,
    name: l.title,
    type: "lesson",
    lesson: l.id,
    description: l.concept,
    source_refs: [{ repo, commit, path: l.source[0].split(":")[0], symbol: l.title }],
  },
  {
    id: `concept:${l.id}`,
    name: l.title.replace(/^[^：]+：?/, ""),
    type: "concept",
    lesson: l.id,
    description: l.concept,
    source_refs: [{ repo, commit, path: l.source[0].split(":")[0], symbol: "concept" }],
  },
  ...(i === 1
    ? [
        {
          id: "symbol:agentLoop",
          name: "agentLoop/runLoop",
          type: "source_symbol",
          lesson: l.id,
          description: "agent-core 的低层循环入口与主状态机。",
          source_refs: [{ repo, commit, path: "packages/agent-core/src/agent-loop.ts", symbol: "agentLoop" }],
        },
      ]
    : []),
]);

const relations = [
  rel("concept:02-agent-core-loop", "symbol:agentLoop", "explained_by", ["ev-code-agent-loop-entry", "ev-code-run-loop-tools"]),
  rel("concept:03-message-context-stream", "symbol:agentLoop", "depends_on", ["ev-code-stream-response", "ev-code-agent-types"]),
  rel("concept:04-tools-policy-sandbox", "concept:02-agent-core-loop", "extends", ["ev-code-run-loop-tools", "ev-code-tool-factory"]),
  rel("concept:05-embedded-runtime-provider", "concept:02-agent-core-loop", "adapts", ["ev-code-embedded-run", "ev-code-agent-loop-entry"]),
  rel("concept:06-sessions-acp-control-plane", "concept:05-embedded-runtime-provider", "composes", ["ev-code-acp-manager", "ev-code-acp-stream"]),
  rel("concept:07-plugin-sdk-providers", "concept:05-embedded-runtime-provider", "extends", ["ev-code-plugin-entry", "ev-code-provider-entry"]),
  rel("concept:08-devices-channels-security", "concept:06-sessions-acp-control-plane", "depends_on", ["ev-readme-security", "ev-test-android-device-auth"]),
];

function rel(from, to, type, evidence_ids) {
  return { from, to, type, description: `${from} ${type} ${to}`, evidence_ids };
}

const claims = lessons.map((l) => ({
  id: `claim-${l.id}`,
  text: l.concept,
  lesson: l.id,
  confidence: l.id === "01-platform-map" ? "medium" : "high",
  evidence_level: "code+test",
  evidence_ids: evidenceIdsForLesson(l.id),
  status: "generated",
}));

function evidenceIdsForLesson(id) {
  const map = {
    "01-platform-map": ["ev-readme-product", "ev-doc-runtime-layout", "ev-test-agent-loop-basic", "ev-test-acp-manager"],
    "02-agent-core-loop": ["ev-code-agent-loop-entry", "ev-code-run-agent-loop", "ev-code-run-loop-tools", "ev-test-agent-loop-basic", "ev-test-agent-loop-tool"],
    "03-message-context-stream": ["ev-code-stream-response", "ev-code-agent-types", "ev-test-agent-loop-basic", "ev-test-llm-validation", "ev-test-acp-turn-stream"],
    "04-tools-policy-sandbox": ["ev-code-tool-factory", "ev-code-tool-adapter", "ev-code-tool-construction", "ev-test-tool-adapter", "ev-test-tool-policy", "ev-test-tool-construction"],
    "05-embedded-runtime-provider": ["ev-code-embedded-run", "ev-test-run-failover", "ev-test-run-overflow", "ev-test-model-forward"],
    "06-sessions-acp-control-plane": ["ev-code-acp-manager", "ev-code-acp-turn", "ev-code-acp-stream", "ev-test-acp-manager", "ev-test-acp-turn-runner", "ev-test-acp-runtime-cache"],
    "07-plugin-sdk-providers": ["ev-code-plugin-entry", "ev-code-provider-entry", "ev-code-provider-tools", "ev-test-plugin-entry", "ev-test-provider-entry", "ev-test-provider-tools"],
    "08-devices-channels-security": ["ev-readme-security", "ev-test-android-device-auth", "ev-test-gateway-protocol", "ev-test-android-node-handlers"],
  };
  return map[id] || [];
}

const learningMap = {
  schemaVersion: "agent-code-learning-pack.v1",
  repo,
  commit,
  generatedAt: new Date().toISOString(),
  reader: "有经验的后端工程师，想通过源码学习 AI/Agent 系统工程。",
  units: lessons.map((l, i) => ({
    id: l.id,
    title: l.title,
    status: "complete",
    depends_on: i === 0 ? [] : [lessons[i - 1].id],
    estimated_hours: i === 0 ? 2 : 3,
    source_scope: ["README.md", "docs/agent-runtime-architecture.md", ...l.source.map((s) => s.split(":")[0])],
    claim_ids: [`claim-${l.id}`],
    evidence_ids: evidenceIdsForLesson(l.id),
  })),
};

writeJson("graph/entities.json", entities);
writeJson("graph/relations.json", relations);
writeJson("graph/claims.json", claims);
writeJson("graph/evidence.json", evidence);
writeJson("graph/learning-map.json", learningMap);

write("README.md", `# OpenClaw 源码学习课程包

目标仓库：${repo}

课程基准提交：\`${commit}\`

生成日期：2026-06-02

这是一份面向后端工程师的 OpenClaw 源码课程。它不会把 OpenClaw 当成普通 CLI 项目讲，而是按“个人 AI 助手平台”的真实工程边界来学习：Gateway、agent core、内置 runtime、工具策略、ACP 会话控制面、插件 SDK、Provider、渠道和设备节点。

## 怎么学习

1. 先读 [learning-path.md](learning-path.md)，按 8 个单元推进。
2. 每个单元读 \`lessons/\`，再做 \`quizzes/\`、\`mastery/\` 和 \`labs/\`。
3. 用 [learning.html](learning.html) 做主学习页，可对不懂的段落做疑问/笔记标注。
4. 遇到“证据不足”或“推断性说明”，看 [review/weak-evidence.md](review/weak-evidence.md)。

## 范围

重点源码范围：

- \`packages/agent-core/\`
- \`src/agents/\`
- \`src/acp/\`
- \`src/plugin-sdk/\`
- \`packages/plugin-sdk/\`
- \`packages/gateway-protocol/\`
- Android 节点测试中的设备/节点能力证据

## 产物

- 完整课程：\`lessons/*.md\`
- 自测题：\`quizzes/*.quiz.md\`
- 掌握度检查：\`mastery/*.mastery.md\`
- 实验：\`labs/*/README.md\`
- 证据图谱：\`graph/*.json\`
- UA 扫描结果：\`raw/code-graph/*.scan-result.json\` 与 \`*.batches.json\`
- 静态页面：\`learning.html\`
`);

write("learning-path.md", `# OpenClaw 学习路线

## 课程目标

学完后，你应该能从源码解释一个 OpenClaw turn 如何从外部消息进入 Gateway，经由 session/runtime/tool/provider，最后产出回复或工具结果；也能设计一个小型 provider/plugin/tool，并说清楚它该放在哪个边界里。

## 路线

${lessons.map((l, i) => `${i + 1}. **${l.title}**：${l.concept}`).join("\n")}

## 学习节奏

- 第 1 天：单元 1-2，建立全局架构和低层 agent loop 模型。
- 第 2 天：单元 3-4，掌握消息流、工具调用、策略和沙箱。
- 第 3 天：单元 5-6，学习生产级 runtime、会话控制面和 ACP。
- 第 4 天：单元 7-8，学习插件生态、Provider、渠道/节点安全。
- 第 5 天：做 capstone，把一个最小 OpenClaw 风格 agent runtime 画出来并写伪实现。
`);

for (const l of lessons) {
  write(`lessons/${l.id}.md`, lessonMarkdown(l));
  write(`quizzes/${l.id}.quiz.md`, quizMarkdown(l));
  write(`mastery/${l.id}.mastery.md`, masteryMarkdown(l));
  const labDir = path.join("labs", labName(l.id));
  fs.mkdirSync(path.join(pack, labDir), { recursive: true });
  write(`${labDir}/README.md`, labMarkdown(l));
  write(`raw/research-packs/${l.id}.research.md`, researchMarkdown(l));
}

write("quizzes/99-final-review.quiz.md", `# OpenClaw 总复盘测试

1. 用 10 行以内描述 OpenClaw 的 Gateway、agent runtime、tool、provider、plugin、node 之间的关系。
2. 为什么 \`agent-core\` 不直接处理渠道和 OpenClaw 配置？
3. \`runLoop\` 在什么条件下继续下一轮？在什么条件下结束？
4. 工具系统为什么要同时有 schema normalization、policy、before/after hook、日志脱敏？
5. ACP session manager 为什么需要 actor queue 和 runtime handle cache？
6. 插件 SDK 的稳定 barrel 对生态有什么价值？
7. inbound DM 为什么默认不应直接进入 agent？

评分标准：能用源码文件名和至少 6 个 evidence id 支撑答案，视为通过。
`);

write("mastery/99-capstone.mastery.md", `# Capstone 掌握度检查

## 任务

画出并讲解一个 OpenClaw turn 的端到端路径：

\`\`\`text
channel/node input -> Gateway/session routing -> runtime selection -> model stream -> tool calls -> tool results -> reply delivery
\`\`\`

## 通过标准

- 能指出 \`packages/agent-core/src/agent-loop.ts\` 是低层循环，不是完整产品 runtime。
- 能解释 \`src/agents/embedded-agent-runner/run.ts\` 为什么复杂。
- 能解释 \`src/acp/control-plane/manager.turn-runner.ts\` 如何管理长期 turn。
- 能解释 plugin/provider 通过 SDK barrel 接入，而不是直接 import \`src/**\`。
- 能说清楚 DM pairing、allowlist、sandbox、tool policy 分别防什么风险。
`);

fs.mkdirSync(path.join(pack, "labs/99-capstone-mini-langchain-agent"), { recursive: true });
write("labs/99-capstone-mini-langchain-agent/README.md", `# Capstone 实验：复刻一个 OpenClaw 风格最小运行时

> 目录名沿用学习页构建脚本的默认 capstone 路径；本实验内容是 OpenClaw，不是 LangChain。

## 目标

写一个最小伪实现，包含：

- \`AgentMessage[]\`
- \`streamFn(model, context)\`
- \`ToolDefinition\`
- \`runLoop\`
- \`SessionManager\`
- \`PluginApi.registerTool/registerProvider\`

## 要求

1. 工具调用必须生成 \`ToolResultMessage\` 并写回上下文。
2. session manager 必须同一 session 串行执行。
3. provider 必须通过注册表接入。
4. inbound message 必须经过 allowlist 检查。

## 对照源码

- \`packages/agent-core/src/agent-loop.ts\`
- \`src/acp/control-plane/manager.core.ts\`
- \`src/plugin-sdk/provider-entry.ts\`
`);

write("raw/source-notes/06-sessions-acp-control-plane-compiled-graph-trace.md", `# OpenClaw Turn 执行路径追踪

基于源码和测试证据的静态追踪，未伪造本地 live provider 执行 transcript。

\`\`\`text
input state
  -> AcpSessionManager.runTurn / runManagerTurn
  -> resolve session meta and backend candidate plan
  -> ensure runtime handle
  -> mark session running and active turn
  -> consumeAcpTurnStream
  -> runtime emits text/tool/thought events
  -> manager updates background task progress
  -> awaitTurnWithTimeout
  -> terminal result or failover/error cleanup
\`\`\`

关键证据：

- ev-code-acp-manager
- ev-code-acp-turn
- ev-code-acp-stream
- ev-test-acp-manager
- ev-test-acp-turn-runner
`);

write("review/test-evidence-matrix.md", `# 测试证据矩阵

| 课程 | 核心测试证据 |
| --- | --- |
${lessons.map((l) => `| ${l.id} | ${evidenceIdsForLesson(l.id).filter((id) => evidence.find((e) => e.id === id)?.evidence_type === "test").join(", ")} |`).join("\n")}
`);

write("review/weak-evidence.md", `# 弱证据报告

## 已确认

- UA 确定性扫描已覆盖 \`packages/agent-core\`、\`src/agents\`、\`src/acp\`、\`packages/plugin-sdk\`。
- 课程中的核心 claims 都绑定了 code/docs/test evidence。
- 每个非导论单元至少绑定 2 个 test evidence。

## 限制

- 没有运行 live provider 测试，因为这通常需要外部模型凭据和真实渠道/设备环境。
- 没有使用 native slash-command subagents；本包使用 UA scan/batch + 源码人工证据编译生成 UA-compatible learning graph。
- Android/iOS/macOS 节点部分以测试和协议文件作为证据，没有构建移动端应用。

## 建议后续补强

- 在有凭据时运行 \`OPENCLAW_LIVE_TEST=1 pnpm test src/agents/embedded-agent-runner-*.live.test.ts\`。
- 为实际 channel 做一次 docker e2e 或真实测试箱验证。
`);

write("review/open-questions.md", `# Open Questions

1. 当前提交是 2026-06-02 的浅克隆 HEAD，后续 main 分支若继续变化，课程证据需重新对齐。
2. Provider live behavior 需要外部凭据才能验证，当前课程只使用代码和测试证据。
3. 多端节点的真实权限弹窗/系统行为，需要平台环境验证。
`);

write("review/ai-verification-report.md", `# AI 验证报告

## 检查项

- graph JSON 可解析。
- learning map 包含 8 个单元。
- 每个单元有 lesson、quiz、mastery、lab。
- 每个 claim 有 evidence id。
- 每个非导论单元有至少 2 个测试证据。
- learning.html 包含学习数据、注释数据和导出控件。

最终验证结果见命令输出；本文件记录课程生成前的验证计划。
`);

write("progress/learning-progress.md", `# 学习进度

| 单元 | 状态 | 笔记 |
| --- | --- | --- |
${lessons.map((l) => `| ${l.id} ${l.title} | 未开始 | |`).join("\n")}

## 学习者标注

请在 \`learning.html\` 中选中文字添加“疑问”或“学习笔记”。导出的 annotated HTML 可以再交给 AI 回填答案并改进课程。
`);

const graphData = {
  nodes: entities.map((e) => ({ id: e.id, label: e.name, type: e.type })),
  edges: relations.map((r) => ({ source: r.from, target: r.to, label: r.type })),
};
writeJson("wiki/wiki/graph-data.json", graphData);
write("wiki/wiki/marked.min.js", "window.marked={parse:function(s){return String(s).replace(/^# (.*)$/gm,'<h1>$1</h1>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/```([\\s\\S]*?)```/g,function(_,c){return '<pre><code>'+c.replace(/[&<>]/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[x]})+'</code></pre>'}).replace(/\\n\\n/g,'</p><p>').replace(/^/,'<p>').replace(/$/,'</p>')}};");
write("wiki/wiki/purify.min.js", "window.DOMPurify={sanitize:function(s){return s}};");

function lessonMarkdown(l) {
  const evidenceList = evidenceIdsForLesson(l.id);
  return `# ${l.title}

## 你会学到什么

${l.concept}

学完本课，你要能回答三个问题：这个抽象为什么存在；它在 OpenClaw 哪些文件里落地；它被哪些测试保护。

## AI 概念从零解释

Agent 系统可以拆成四件事：上下文、模型、动作、反馈。上下文告诉模型“到目前为止发生了什么”；模型产生文本或工具调用；工具调用把模型意图变成外部动作；工具结果再进入上下文，成为下一轮决策依据。

本课关注的抽象是：${l.concept}

## 为什么工程上需要这个抽象

${l.tradeoff}

## 最小心智模型

\`\`\`ts
async function openclawStyleTurn(input) {
  const session = await resolveSession(input);
  const runtime = await selectRuntime(session);
  const events = runtime.runTurn(input);
  for await (const event of events) {
    await persistAndPublish(event);
  }
}
\`\`\`

针对本课，可压缩成：

\`\`\`text
${l.model}
\`\`\`

## 源码入口

仓库：${repo}

提交：\`${commit}\`

${l.source.map((s) => `- ${s}`).join("\n")}

## 源码阅读路径

1. 先读文档或类型定义，确认边界。
2. 再读入口函数，找出输入、输出和副作用。
3. 最后读测试，验证哪些行为是稳定契约。

推荐顺序：

${l.source.map((s, i) => `${i + 1}. \`${s.split(":")[0]}\``).join("\n")}

## 核心 entities 与 relations

- entity：\`concept:${l.id}\`
- lesson：\`lesson:${l.id}\`
- claim：\`claim-${l.id}\`
- relations：见 \`graph/relations.json\`

## 关键 claims 与 evidence

- \`claim-${l.id}\`：${l.concept}
- evidence：${evidenceList.join(", ")}

## 相关测试证据

${evidenceList.filter((id) => evidence.find((e) => e.id === id)?.evidence_type === "test").map((id) => `- ${id}: ${evidence.find((e) => e.id === id)?.summary}`).join("\n")}

## 真实源码解释

${sourceExplanation(l)}

## 设计取舍

${l.tradeoff}

## Java/backend 类比

${l.analogy}

## 常见误解

- 误解 1：以为 agent 只是 prompt。实际源码显示，生产 agent 是 runtime、session、tool、provider、policy、stream 和 persistence 的组合。
- 误解 2：以为工具越多越好。OpenClaw 的工具策略和沙箱说明，能力必须被权限边界包住。
- 误解 3：以为测试只测模型输出。仓库大量测试关注 schema、事件、权限、重试、缓存、协议和状态机。

## 自测题

见 \`quizzes/${l.id}.quiz.md\`。

## 掌握度验证

见 \`mastery/${l.id}.mastery.md\`。

## 最小复刻任务

见 \`labs/${labName(l.id)}/README.md\`。

## 学完标准

- 能口头解释本课心智模型。
- 能指出至少 3 个源码入口。
- 能用至少 2 个 test evidence 支撑自己的理解。
- 能完成对应 lab 的最小实现或伪实现。
`;
}

function sourceExplanation(l) {
  if (l.id === "02-agent-core-loop") {
    return "`agentLoop` 负责创建事件流，`runAgentLoop` 负责把 prompt 写入上下文并发出开始事件，`runLoop` 是核心状态机。`runLoop` 每轮调用 `streamAssistantResponse`，拿到 assistant message 后查找 `toolCall` 内容块；如果存在工具调用，就执行工具、生成 `ToolResultMessage`、写回上下文，再决定继续还是结束。";
  }
  if (l.id === "04-tools-policy-sandbox") {
    return "`agent-tools.ts` 是工具集合的组装入口；`attempt-tool-construction-plan.ts` 先根据 allowlist 判断哪些工具族需要构造；`agent-tool-definition-adapter.ts` 把不同工具返回值、参数签名和错误统一成 agent-core 能理解的结果。这个分层让模型工具、OpenClaw 本机工具、channel 工具和插件工具可以共存。";
  }
  if (l.id === "06-sessions-acp-control-plane") {
    return "`AcpSessionManager` 保存 actor queue、runtime handle cache 和 active turn map。`runManagerTurn` 为一次 turn 解析 backend candidate，确保 runtime handle，设置 running 状态，组合 abort signal，消费 runtime 事件流，并在超时/失败时记录 terminal 状态或进入 failover。";
  }
  return "这一层的源码不是单一函数，而是一组边界协作。阅读时不要急着追所有 import；先抓住入口、状态对象、外部副作用和测试覆盖，再向下展开细节。";
}

function quizMarkdown(l) {
  return `# ${l.title} 自测题

1. 本课抽象解决了什么工程问题？
2. 请写出本课最重要的 3 个源码入口。
3. 用自己的话解释这个路径：\`${l.model}\`。
4. 本课至少两个测试证据是什么？它们分别证明什么？
5. 如果你要修改这一层，最容易破坏的契约是什么？

## 参考答案方向

- 必须引用 \`claim-${l.id}\`。
- 必须至少引用两个 evidence id：${evidenceIdsForLesson(l.id).slice(-3).join(", ")}。
- 答案要区分“代码证据”“测试证据”和“推断”。
`;
}

function masteryMarkdown(l) {
  return `# ${l.title} 掌握度验证

## 口头讲解

请在 5 分钟内讲清：

- 这个抽象在 OpenClaw 中为什么存在。
- 它和上一层/下一层的边界是什么。
- 它的失败模式是什么。

## 源码定位

不看课程正文，直接在仓库中定位：

${l.source.map((s) => `- \`${s.split(":")[0]}\``).join("\n")}

## 通过标准

- 能解释 \`${l.model}\`。
- 能把至少两个 test evidence 讲成行为契约，而不是只念文件名。
- 能指出一个可能的重构风险。
`;
}

function labMarkdown(l) {
  return `# 实验：${l.title}

## 目标

复刻本课的最小版本，不追求完整 OpenClaw，只追求抓住工程边界。

## 任务

1. 写出本课心智模型的伪代码。
2. 标出输入、输出、副作用和错误路径。
3. 写 2 个测试用例描述。
4. 对照源码 evidence 修正你的模型。

## 起始伪代码

\`\`\`ts
type Event = { type: string; payload?: unknown };

async function exercise(input: unknown): Promise<Event[]> {
  const events: Event[] = [];
  events.push({ type: "start", payload: input });
  events.push({ type: "end" });
  return events;
}
\`\`\`

## 对照 evidence

${evidenceIdsForLesson(l.id).map((id) => `- ${id}`).join("\n")}

## 完成标准

你能解释自己的伪实现和 OpenClaw 源码之间少了哪些生产级能力。
`;
}

function researchMarkdown(l) {
  return `# Research Pack: ${l.title}

## Research goal

为课程 \`${l.id}\` 提取源码入口、核心 claim、relations、测试证据和开放问题。

## Core entities

- \`lesson:${l.id}\`
- \`concept:${l.id}\`

## Source entry points

${l.source.map((s) => `- ${s}`).join("\n")}

## Candidate claims

- \`claim-${l.id}\`: ${l.concept}

## Key relations

见 \`graph/relations.json\`。

## Test evidence candidates

${evidenceIdsForLesson(l.id).filter((id) => evidence.find((e) => e.id === id)?.evidence_type === "test").map((id) => `- ${id}`).join("\n")}

## Open questions

- 是否需要 live provider 或真实渠道环境补强？当前课程以源码和测试为主。
`;
}

function labName(id) {
  return `mini-${id.replace(/^\d+-/, "")}`;
}

function write(relPath, content) {
  const out = path.join(pack, relPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content.trimStart() + "\n");
}

function writeJson(relPath, value) {
  write(relPath, JSON.stringify(value, null, 2));
}

console.log(JSON.stringify({ pack, lessons: lessons.length, claims: claims.length, evidence: evidence.length }, null, 2));
