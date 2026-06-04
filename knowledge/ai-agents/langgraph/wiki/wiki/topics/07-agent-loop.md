# Agent Loop：条件边、Command、interrupt 与 ReAct 循环

Agent loop 是一个状态机循环：模型节点决定继续、调用工具或结束；工具结果回到模型；interrupt/Command 可以暂停、恢复或跳转。

主要 evidence: ev-command-code, ev-interrupt-code, ev-react-loop-code, ev-test-interrupt-loop, ev-test-parent-command。
