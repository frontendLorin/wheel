const EntryOptionPlugin = require('./EntryOptionPlugin');

class WebpackOptionsApply {
  process(options, compiler) {
    // 挂载入口点，它会监听 make 事件
    new EntryOptionPlugin().apply(compiler);
    // 触发 compiler.hooks.entryOption 钩子
    compiler.hooks.entryOption.call(options.context, options.entry);
    // 触发compiler.hooks.afterPlugins，即插件挂载完成钩子
    compiler.hooks.afterPlugins.call(compiler);
  }
}

module.exports = WebpackOptionsApply;
