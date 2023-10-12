const SyncHook = require('./SyncHook');

const syncHook = new SyncHook(['name']);

syncHook.tap('a', (name) => {
  console.log('a: ', name);
});

syncHook.tap('b', (name) => {
  console.log('b: ', name);
});

syncHook.call('张三');
