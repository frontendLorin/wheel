const SingleEntryPlugin = require('./SingleEntryPlugin');

class EntryOptionPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
      // 开始监听单个入口
      new SingleEntryPlugin(context, entry, 'main').apply(compiler);

      return true;
    });
  }
}

module.exports = EntryOptionPlugin;
