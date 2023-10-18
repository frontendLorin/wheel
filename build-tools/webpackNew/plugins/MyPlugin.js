class MyPlugin {
  apply(compiler) {
    console.log('MyPlugin apply');
    compiler.hooks.environment.tap('MyPlugin', () => {
      console.log('MyPlugin environment callback excute');
    });
  }
}

module.exports = MyPlugin;
