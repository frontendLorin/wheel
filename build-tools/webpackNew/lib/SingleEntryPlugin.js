class SingleEntryPlugin {
  constructor(context, entry, name) {
    this.context = context; // 上下文目录，绝对路径
    this.entry = entry; // 入口文件，相对路径
    this.name = name || ''; // 入口名称
  }

  apply(compiler) {
    compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
      // 开始从入口文件进行递归编译
      compilation.addEntry(this.context, this.entry, this.name, (err) => {
        callback(err);
      });
    });
  }
}

module.exports = SingleEntryPlugin;
