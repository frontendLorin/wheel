const SingleEntryPlugin = require('./SingleEntryPlugin');

class EntryOptionPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
      if (typeof entry === 'string') {
        // 开始监听单个入口
        new SingleEntryPlugin(context, entry, 'main').apply(compiler);
      } else {
        for (let entryName in entry) {
          // 开始监听单个入口
          new SingleEntryPlugin(context, entry[entryName], entryName).apply(compiler);
        }
      }

      return true;
    });
  }
}

module.exports = EntryOptionPlugin;
