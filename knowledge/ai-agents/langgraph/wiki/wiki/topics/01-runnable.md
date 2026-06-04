# LangGraph 的可执行图：从 Runnable 到 CompiledStateGraph

把图看成一个可调用程序：输入状态进入 START，节点函数写入局部更新，运行时把更新合并成下一轮状态，直到 END。

主要 evidence: ev-stategraph-code, ev-compiled-code, ev-test-state-basic, ev-test-runnable。
