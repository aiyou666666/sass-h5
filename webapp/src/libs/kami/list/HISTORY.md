## 1.0.0

发布稳定版本

## 1.0.1

为`scrollTo`方法添加 `callback` 参数，当`time`参数不为0时，动画执行结束后调用该回调

## 1.0.2

在`resize`时，计算高度时排除data-role为index-wrap的元素，index-wrap是grouplist右侧的字母部分，一起计算会导致grouplist滚动到最底部依旧可以继续滚动的bug。