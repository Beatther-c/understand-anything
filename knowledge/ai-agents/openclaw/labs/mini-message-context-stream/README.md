# 实验：消息、上下文与流式事件

## 目标

复刻本课的最小版本，不追求完整 OpenClaw，只追求抓住工程边界。

## 任务

1. 写出本课心智模型的伪代码。
2. 标出输入、输出、副作用和错误路径。
3. 写 2 个测试用例描述。
4. 对照源码 evidence 修正你的模型。

## 起始伪代码

```ts
type Event = { type: string; payload?: unknown };

async function exercise(input: unknown): Promise<Event[]> {
  const events: Event[] = [];
  events.push({ type: "start", payload: input });
  events.push({ type: "end" });
  return events;
}
```

## 对照 evidence

- ev-code-stream-response
- ev-code-agent-types
- ev-test-agent-loop-basic
- ev-test-llm-validation
- ev-test-acp-turn-stream

## 完成标准

你能解释自己的伪实现和 OpenClaw 源码之间少了哪些生产级能力。

