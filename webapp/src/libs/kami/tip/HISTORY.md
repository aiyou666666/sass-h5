## 1.0.0

在原有的单例基础上提供非单例使用方式。


```
//kami为kami组件所在的路径别名，具体路径参考项目自身配置
var Tip = require('kami/tip.js');
//单例
Tip.show({content:'我是tip'});
//非单例
var tip = new Tip({content:'我是tip'});

```

## 1.0.1
+ `add` 提供`align`参数，选择tip的位置，选项为`top`,`center`,`bottom`，默认为`center`.
+ `add` verticalOffset 参数， 当align为top，或者bottom时额外的偏移量，默认偏移为tip本身的高度