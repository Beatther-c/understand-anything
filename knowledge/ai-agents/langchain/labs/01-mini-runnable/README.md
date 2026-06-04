# Lab 01: Mini Runnable

目标：实现一个最小版 LangChain Runnable 心智模型。

## 必做功能

- `MiniRunnable.invoke(input, config=None)`
- `MiniRunnable.batch(inputs, config=None)`
- `MiniRunnable.stream(input, config=None)`
- `MiniRunnable.__or__(other)`
- `MiniSequence.invoke(input, config=None)`
- `MiniLambda(func)`

## 验收用例

```python
add_one = MiniLambda(lambda x: x + 1)
mul_two = MiniLambda(lambda x: x * 2)
chain = add_one | mul_two

assert chain.invoke(1) == 4
assert chain.batch([1, 2, 3]) == [4, 6, 8]
assert list(chain.stream(1)) == [4]
```

## 加分功能

- 支持 `config={"max_concurrency": 3}`。
- 支持 `on_start` / `on_end` callback。
- 支持 `name`，方便打印执行链。

## 复盘问题

1. 你的 `stream` 是真正流式，还是只是包装 `invoke`？
2. 如果某一步失败，错误应该在哪里捕获？
3. 如果要支持 async，你会怎么改接口？

