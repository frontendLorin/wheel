const Compiler = require('./Compiler');
const WebpackOptionsApply = require('./WebpackOptionsApply');
const NodeEnvironmentPlugin = require('./pluguins/NodeEnvironmentPlugin');

const webpack = (options) => {
  options.context = options.options || process.cwd();
  // 编译对象，一次编译只会有一个 compiler
  let compiler = new Compiler(options.context, options);

  // 设置 node 的环境，主要是设置读写文件用哪个模块
  new NodeEnvironmentPlugin().apply(compiler);

  // 调用插件
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      if (typeof plugin === 'function') {
        plugin.call(compiler, compiler);
      } else if (plugin) {
        plugin.apply(compiler);
      }
    }
  }

  // 触发 compiler environment 的钩子执行
  compiler.hooks.environment.call();
  // 触发 compiler afterEnvironment 的钩子执行
  compiler.hooks.afterEnvironment.call();

  new WebpackOptionsApply().process(options, compiler);

  // 触发 compiler initialize 的钩子执行
  compiler.hooks.initialize.call();
  return compiler;
};

module.exports = webpack;
