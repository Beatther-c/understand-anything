# 实验：插件 SDK 与 Provider 扩展：把生态接入运行时

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

- ev-code-plugin-entry
- ev-code-provider-entry
- ev-code-provider-tools
- ev-test-plugin-entry
- ev-test-provider-entry
- ev-test-provider-tools

## 完成标准

你能解释自己的伪实现和 OpenClaw 源码之间少了哪些生产级能力。

