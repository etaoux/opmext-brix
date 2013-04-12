opm 的 brix 扩展

为 [opm](https://github.com/objectjs/opm) 提供 brix 组件开发的相关功能。

可直接安装 [bpm](https://github.com/etaoux/bpm) 项目。

## 功能

* 新增 `create` 命令，可直接新建组件库到 `components` 目录中；
* `init` 增加 `--component` 选项，可以初始化brix组件的js、css、html相关文件，`create` 命令调用此命令；
* `install` 安装库采用扁平存储在 `imports` 目录中，并会替换其中的 brix 组件路径。