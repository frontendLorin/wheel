const { SyncHook, SyncBailHook, AsyncSeriesHook, AsyncParallelHook } = require('tapable');
const Compilation = require('./Compilation');
const Stats = require('./Stats');
const { mkdirp } = require('mkdirp');
const path = require('path');

class Compiler {
  constructor(context, options) {
    // 保存当前上下文路径，程序运行路径
    this.context = context;
    this.options = options;
    this.hooks = {
      /** @type {SyncHook<[]>} */
      initialize: new SyncHook([]),

      /** @type {SyncBailHook<[Compilation], boolean | undefined>} */
      shouldEmit: new SyncBailHook(['compilation']),
      /** @type {AsyncSeriesHook<[Stats]>} */
      done: new AsyncSeriesHook(['stats']),
      /** @type {SyncHook<[Stats]>} */
      afterDone: new SyncHook(['stats']),
      /** @type {AsyncSeriesHook<[]>} */
      additionalPass: new AsyncSeriesHook([]),
      /** @type {AsyncSeriesHook<[Compiler]>} */
      beforeRun: new AsyncSeriesHook(['compiler']),
      /** @type {AsyncSeriesHook<[Compiler]>} */
      run: new AsyncSeriesHook(['compiler']),
      /** @type {AsyncSeriesHook<[Compilation]>} */
      emit: new AsyncSeriesHook(['compilation']),
      /** @type {AsyncSeriesHook<[string, AssetEmittedInfo]>} */
      assetEmitted: new AsyncSeriesHook(['file', 'info']),
      /** @type {AsyncSeriesHook<[Compilation]>} */
      afterEmit: new AsyncSeriesHook(['compilation']),

      /** @type {SyncHook<[Compilation, CompilationParams]>} */
      thisCompilation: new SyncHook(['compilation', 'params']),
      /** @type {SyncHook<[Compilation, CompilationParams]>} */
      compilation: new SyncHook(['compilation', 'params']),
      /** @type {SyncHook<[NormalModuleFactory]>} */
      normalModuleFactory: new SyncHook(['normalModuleFactory']),
      /** @type {SyncHook<[ContextModuleFactory]>}  */
      contextModuleFactory: new SyncHook(['contextModuleFactory']),

      /** @type {AsyncSeriesHook<[CompilationParams]>} */
      beforeCompile: new AsyncSeriesHook(['params']),
      /** @type {SyncHook<[CompilationParams]>} */
      compile: new SyncHook(['params']),
      /** @type {AsyncParallelHook<[Compilation]>} */
      make: new AsyncParallelHook(['compilation']),
      /** @type {AsyncParallelHook<[Compilation]>} */
      finishMake: new AsyncSeriesHook(['compilation']),
      /** @type {AsyncSeriesHook<[Compilation]>} */
      afterCompile: new AsyncSeriesHook(['compilation']),

      /** @type {AsyncSeriesHook<[]>} */
      readRecords: new AsyncSeriesHook([]),
      /** @type {AsyncSeriesHook<[]>} */
      emitRecords: new AsyncSeriesHook([]),

      /** @type {AsyncSeriesHook<[Compiler]>} */
      watchRun: new AsyncSeriesHook(['compiler']),
      /** @type {SyncHook<[Error]>} */
      failed: new SyncHook(['error']),
      /** @type {SyncHook<[string | null, number]>} */
      invalid: new SyncHook(['filename', 'changeTime']),
      /** @type {SyncHook<[]>} */
      watchClose: new SyncHook([]),
      /** @type {AsyncSeriesHook<[]>} */
      shutdown: new AsyncSeriesHook([]),

      /** @type {SyncBailHook<[string, string, any[]], true>} */
      infrastructureLog: new SyncBailHook(['origin', 'type', 'args']),

      // TODO the following hooks are weirdly located here
      // TODO move them for webpack 5
      /** @type {SyncHook<[]>} */
      environment: new SyncHook([]),
      /** @type {SyncHook<[]>} */
      afterEnvironment: new SyncHook([]),
      /** @type {SyncHook<[Compiler]>} */
      afterPlugins: new SyncHook(['compiler']),
      /** @type {SyncHook<[Compiler]>} */
      afterResolvers: new SyncHook(['compiler']),
      /** @type {SyncBailHook<[string, Entry], boolean>} */
      entryOption: new SyncBailHook(['context', 'entry'])
    };
  }

  // 创建 compilation 对象
  newCompilation() {
    const compilation = new Compilation(this);
    this.hooks.thisCompilation.call(compilation, {});
    this.hooks.compilation.call(compilation, {});
    return compilation;
  }

  // 开始编译
  compile(onCompiled) {
    this.hooks.beforeCompile.callAsync({}, () => {
      this.hooks.compile.call();

      // 创建一个新的 compilation 对象，这里面放着本次编译的结果
      const compilation = this.newCompilation();

      this.hooks.make.callAsync(compilation, () => {
        // seal: 通过模块依赖生成代码块
        compilation.seal(() => {
          this.hooks.afterCompile.callAsync(compilation, () => {
            // 将代码块写入文件系统
            return onCompiled(compilation);
          });
        });
      });
    });
  }
  emitAssets(compilation, callback) {
    // 写入文件系统
    const emitFiles = () => {
      // 是一个对象 {文件名字: 源码}
      const assets = compilation.assets;

      for (let filename in assets) {
        const source = assets[filename];
        const targetPath = path.posix.join(this.options.output.path, filename);
        this.outputFileSystem.writeFileSync(targetPath, source);
      }

      callback();
    };
    this.hooks.emit.callAsync(compilation, () => {
      mkdirp(this.options.output.path).then(() => {
        emitFiles();
      });
    });
  }
  run(callback) {
    // 编译完成后的回调
    const onCompiled = (compilation) => {
      this.emitAssets(compilation, () => {
        const stats = new Stats(compilation);
        this.hooks.done.callAsync(stats, () => {
          return callback(null, '编译结束');
        });
      });
    };
    this.hooks.beforeRun.callAsync(this, () => {
      this.hooks.run.callAsync(this, () => {
        this.compile(onCompiled);
      });
    });
  }
}

module.exports = Compiler;
