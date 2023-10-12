class HookCodeFactory {
  setup(hookInstance, options) {
    this.options = options;
    hookInstance._x = options.taps.map((item) => item.fn);
  }

  args() {
    return this.options.args.join(',');
  }

  header() {
    return `
      "use strict;"
      var context;
      var _x = this._x;
    `;
  }

  content() {
    return this.options.taps.reduce((prev, _cur, index) => {
      return `
        ${prev}
        var _fn${index} = _x[${index}];
        _fn${index}(${this.args()});
      `;
    }, '');
  }

  create() {
    return new Function(this.args(), `${this.header()}${this.content()}`);
  }
}

module.exports = HookCodeFactory;
