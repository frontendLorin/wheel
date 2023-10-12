class Hook {
  constructor(args) {
    this._args = args; // 保存监听函数接收的参数名称列表
    this.taps = []; // 保存监听函数
    this.compile = this.compile; // 需要子类去实现的方法
  }

  compile(options) {
    console.log('options: ', options);
    throw new Error('Abstract: should be overridden');
  }

  tap(options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options.trim()
      };
    } else if (typeof options !== 'object' || options === null) {
      throw new Error('Invalid tap options');
    }
    if (typeof options.name !== 'string' || options.name === '') {
      throw new Error('Missing name for tap');
    }
    options = Object.assign({ fn }, options);
    this._insert(options);
  }

  _insert(item) {
    this.taps.push(item);
  }

  call(...args) {
    const callFn = this._createCall();
    callFn.apply(this, args);
  }

  _createCall() {
    return this.compile({
      taps: this.taps,
      args: this._args
    });
  }
}

module.exports = Hook;
