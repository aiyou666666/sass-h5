## confirm

confirm 组件提供了两种使用形式：单例和多例。

使用方式：

```
//kami为kami组件所在的路径别名，具体路径参考项目自身配置
var Confirm = require('kami/confirm.js');
//单例
Confirm.show({content:'我是alert'});
//非单例
var confirm = new Confirm({content:'我是alert'});

```