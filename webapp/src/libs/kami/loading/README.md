## loading

loading 组件提供了两种使用形式：单例和多例。

使用方式：

```
//kami为kami组件所在的路径别名，具体路径参考项目自身配置
var Loading = require('kami/loading.js');
//单例
Loading.show({content:'我是loading'});
//非单例
var loading = new Loading({content:'我是loading'});

```