const {
  SyncHook,
  SyncBailHook,
  AsyncSeriesHook,
  AsyncParallelHook,
  SyncWaterfallHook,
  AsyncSeriesBailHook,
  HookMap
} = require('tapable');
const NormalModuleFactory = require('./NormalModuleFactory');
const path = require('path');
const Chunk = require('./Chunk');
const fs = require('fs');
const ejs = require('ejs');
console.log(fs.readFileSync);
const mainTemplate = fs.readFileSync(path.posix.join(__dirname, './main.ejs'), 'utf8');
const mainRender = ejs.compile(mainTemplate);
const normalModuleFactory = new NormalModuleFactory();

class Compilation {
  constructor(compiler) {
    this.compiler = compiler;
    this.options = compiler.options;
    this.context = compiler.context;
    this.inputFileSystem = compiler.inputFileSystem;
    this.outputFileSystem = compiler.outputFileSystem;
    //  入口模块列表，存放所有的入口模块
    this.entries = [];
    // 这是一个模块的数组，里面都是模块实例
    this.modules = [];
    // 这是一个对象, key 是模块的绝对路径，值是模块的实例
    this._modules = {};
    // 编译后的代码块
    this.chunks = [];
    // 文件数组
    this.files = [];
    // 资源对象
    this.assets = {};

    this.hooks = Object.freeze({
      /** @type {SyncHook<[Module]>} */
      buildModule: new SyncHook(['module']),
      /** @type {SyncHook<[Module]>} */
      rebuildModule: new SyncHook(['module']),
      /** @type {SyncHook<[Module, WebpackError]>} */
      failedModule: new SyncHook(['module', 'error']),
      /** @type {SyncHook<[Module]>} */
      succeedModule: new SyncHook(['module']),
      /** @type {SyncHook<[Module]>} */
      stillValidModule: new SyncHook(['module']),

      /** @type {SyncHook<[Dependency, EntryOptions]>} */
      addEntry: new SyncHook(['entry', 'options']),
      /** @type {SyncHook<[Dependency, EntryOptions, Error]>} */
      failedEntry: new SyncHook(['entry', 'options', 'error']),
      /** @type {SyncHook<[Dependency, EntryOptions, Module]>} */
      succeedEntry: new SyncHook(['entry', 'options', 'module']),

      /** @type {SyncWaterfallHook<[(string[] | ReferencedExport)[], Dependency, RuntimeSpec]>} */
      dependencyReferencedExports: new SyncWaterfallHook(['referencedExports', 'dependency', 'runtime']),

      /** @type {SyncHook<[ExecuteModuleArgument, ExecuteModuleContext]>} */
      executeModule: new SyncHook(['options', 'context']),
      /** @type {AsyncParallelHook<[ExecuteModuleArgument, ExecuteModuleContext]>} */
      prepareModuleExecution: new AsyncParallelHook(['options', 'context']),

      /** @type {AsyncSeriesHook<[Iterable<Module>]>} */
      finishModules: new AsyncSeriesHook(['modules']),
      /** @type {AsyncSeriesHook<[Module]>} */
      finishRebuildingModule: new AsyncSeriesHook(['module']),
      /** @type {SyncHook<[]>} */
      unseal: new SyncHook([]),
      /** @type {SyncHook<[]>} */
      seal: new SyncHook([]),

      /** @type {SyncHook<[]>} */
      beforeChunks: new SyncHook([]),
      /**
       * The `afterChunks` hook is called directly after the chunks and module graph have
       * been created and before the chunks and modules have been optimized. This hook is useful to
       * inspect, analyze, and/or modify the chunk graph.
       * @type {SyncHook<[Iterable<Chunk>]>}
       */
      afterChunks: new SyncHook(['chunks']),

      /** @type {SyncBailHook<[Iterable<Module>]>} */
      optimizeDependencies: new SyncBailHook(['modules']),
      /** @type {SyncHook<[Iterable<Module>]>} */
      afterOptimizeDependencies: new SyncHook(['modules']),

      /** @type {SyncHook<[]>} */
      optimize: new SyncHook([]),
      /** @type {SyncBailHook<[Iterable<Module>]>} */
      optimizeModules: new SyncBailHook(['modules']),
      /** @type {SyncHook<[Iterable<Module>]>} */
      afterOptimizeModules: new SyncHook(['modules']),

      /** @type {SyncBailHook<[Iterable<Chunk>, ChunkGroup[]]>} */
      optimizeChunks: new SyncBailHook(['chunks', 'chunkGroups']),
      /** @type {SyncHook<[Iterable<Chunk>, ChunkGroup[]]>} */
      afterOptimizeChunks: new SyncHook(['chunks', 'chunkGroups']),

      /** @type {AsyncSeriesHook<[Iterable<Chunk>, Iterable<Module>]>} */
      optimizeTree: new AsyncSeriesHook(['chunks', 'modules']),
      /** @type {SyncHook<[Iterable<Chunk>, Iterable<Module>]>} */
      afterOptimizeTree: new SyncHook(['chunks', 'modules']),

      /** @type {AsyncSeriesBailHook<[Iterable<Chunk>, Iterable<Module>]>} */
      optimizeChunkModules: new AsyncSeriesBailHook(['chunks', 'modules']),
      /** @type {SyncHook<[Iterable<Chunk>, Iterable<Module>]>} */
      afterOptimizeChunkModules: new SyncHook(['chunks', 'modules']),
      /** @type {SyncBailHook<[], boolean | undefined>} */
      shouldRecord: new SyncBailHook([]),

      /** @type {SyncHook<[Chunk, Set<string>, RuntimeRequirementsContext]>} */
      additionalChunkRuntimeRequirements: new SyncHook(['chunk', 'runtimeRequirements', 'context']),
      /** @type {HookMap<SyncBailHook<[Chunk, Set<string>, RuntimeRequirementsContext]>>} */
      runtimeRequirementInChunk: new HookMap(() => new SyncBailHook(['chunk', 'runtimeRequirements', 'context'])),
      /** @type {SyncHook<[Module, Set<string>, RuntimeRequirementsContext]>} */
      additionalModuleRuntimeRequirements: new SyncHook(['module', 'runtimeRequirements', 'context']),
      /** @type {HookMap<SyncBailHook<[Module, Set<string>, RuntimeRequirementsContext]>>} */
      runtimeRequirementInModule: new HookMap(() => new SyncBailHook(['module', 'runtimeRequirements', 'context'])),
      /** @type {SyncHook<[Chunk, Set<string>, RuntimeRequirementsContext]>} */
      additionalTreeRuntimeRequirements: new SyncHook(['chunk', 'runtimeRequirements', 'context']),
      /** @type {HookMap<SyncBailHook<[Chunk, Set<string>, RuntimeRequirementsContext]>>} */
      runtimeRequirementInTree: new HookMap(() => new SyncBailHook(['chunk', 'runtimeRequirements', 'context'])),

      /** @type {SyncHook<[RuntimeModule, Chunk]>} */
      runtimeModule: new SyncHook(['module', 'chunk']),

      /** @type {SyncHook<[Iterable<Module>, any]>} */
      reviveModules: new SyncHook(['modules', 'records']),
      /** @type {SyncHook<[Iterable<Module>]>} */
      beforeModuleIds: new SyncHook(['modules']),
      /** @type {SyncHook<[Iterable<Module>]>} */
      moduleIds: new SyncHook(['modules']),
      /** @type {SyncHook<[Iterable<Module>]>} */
      optimizeModuleIds: new SyncHook(['modules']),
      /** @type {SyncHook<[Iterable<Module>]>} */
      afterOptimizeModuleIds: new SyncHook(['modules']),

      /** @type {SyncHook<[Iterable<Chunk>, any]>} */
      reviveChunks: new SyncHook(['chunks', 'records']),
      /** @type {SyncHook<[Iterable<Chunk>]>} */
      beforeChunkIds: new SyncHook(['chunks']),
      /** @type {SyncHook<[Iterable<Chunk>]>} */
      chunkIds: new SyncHook(['chunks']),
      /** @type {SyncHook<[Iterable<Chunk>]>} */
      optimizeChunkIds: new SyncHook(['chunks']),
      /** @type {SyncHook<[Iterable<Chunk>]>} */
      afterOptimizeChunkIds: new SyncHook(['chunks']),

      /** @type {SyncHook<[Iterable<Module>, any]>} */
      recordModules: new SyncHook(['modules', 'records']),
      /** @type {SyncHook<[Iterable<Chunk>, any]>} */
      recordChunks: new SyncHook(['chunks', 'records']),

      /** @type {SyncHook<[Iterable<Module>]>} */
      optimizeCodeGeneration: new SyncHook(['modules']),

      /** @type {SyncHook<[]>} */
      beforeModuleHash: new SyncHook([]),
      /** @type {SyncHook<[]>} */
      afterModuleHash: new SyncHook([]),

      /** @type {SyncHook<[]>} */
      beforeCodeGeneration: new SyncHook([]),
      /** @type {SyncHook<[]>} */
      afterCodeGeneration: new SyncHook([]),

      /** @type {SyncHook<[]>} */
      beforeRuntimeRequirements: new SyncHook([]),
      /** @type {SyncHook<[]>} */
      afterRuntimeRequirements: new SyncHook([]),

      /** @type {SyncHook<[]>} */
      beforeHash: new SyncHook([]),
      /** @type {SyncHook<[Chunk]>} */
      contentHash: new SyncHook(['chunk']),
      /** @type {SyncHook<[]>} */
      afterHash: new SyncHook([]),
      /** @type {SyncHook<[any]>} */
      recordHash: new SyncHook(['records']),
      /** @type {SyncHook<[Compilation, any]>} */
      record: new SyncHook(['compilation', 'records']),

      /** @type {SyncHook<[]>} */
      beforeModuleAssets: new SyncHook([]),
      /** @type {SyncBailHook<[], boolean>} */
      shouldGenerateChunkAssets: new SyncBailHook([]),
      /** @type {SyncHook<[]>} */
      beforeChunkAssets: new SyncHook([]),
      /** @type {AsyncSeriesHook<[CompilationAssets]>} */
      processAdditionalAssets: new AsyncSeriesHook(['assets']),

      /** @type {SyncBailHook<[], boolean>} */
      needAdditionalSeal: new SyncBailHook([]),
      /** @type {AsyncSeriesHook<[]>} */
      afterSeal: new AsyncSeriesHook([]),

      /** @type {SyncWaterfallHook<[RenderManifestEntry[], RenderManifestOptions]>} */
      renderManifest: new SyncWaterfallHook(['result', 'options']),

      /** @type {SyncHook<[Hash]>} */
      fullHash: new SyncHook(['hash']),
      /** @type {SyncHook<[Chunk, Hash, ChunkHashContext]>} */
      chunkHash: new SyncHook(['chunk', 'chunkHash', 'ChunkHashContext']),

      /** @type {SyncHook<[Module, string]>} */
      moduleAsset: new SyncHook(['module', 'filename']),
      /** @type {SyncHook<[Chunk, string]>} */
      chunkAsset: new SyncHook(['chunk', 'filename']),

      /** @type {SyncWaterfallHook<[string, object, AssetInfo]>} */
      assetPath: new SyncWaterfallHook(['path', 'options', 'assetInfo']),

      /** @type {SyncBailHook<[], boolean>} */
      needAdditionalPass: new SyncBailHook([]),

      /** @type {SyncHook<[Compiler, string, number]>} */
      childCompiler: new SyncHook(['childCompiler', 'compilerName', 'compilerIndex']),

      /** @type {SyncBailHook<[string, LogEntry], true>} */
      log: new SyncBailHook(['origin', 'logEntry']),

      /** @type {SyncWaterfallHook<[WebpackError[]]>} */
      processWarnings: new SyncWaterfallHook(['warnings']),
      /** @type {SyncWaterfallHook<[WebpackError[]]>} */
      processErrors: new SyncWaterfallHook(['errors']),

      /** @type {HookMap<SyncHook<[Partial<NormalizedStatsOptions>, CreateStatsOptionsContext]>>} */
      statsPreset: new HookMap(() => new SyncHook(['options', 'context'])),
      /** @type {SyncHook<[Partial<NormalizedStatsOptions>, CreateStatsOptionsContext]>} */
      statsNormalize: new SyncHook(['options', 'context']),
      /** @type {SyncHook<[StatsFactory, NormalizedStatsOptions]>} */
      statsFactory: new SyncHook(['statsFactory', 'options']),
      /** @type {SyncHook<[StatsPrinter, NormalizedStatsOptions]>} */
      statsPrinter: new SyncHook(['statsPrinter', 'options']),

      get normalModuleLoader() {
        return getNormalModuleLoader();
      }
    });
  }

  addEntry(context, entry, name, finallyCallback) {
    this.hooks.addEntry.call(entry, name);
    this._addModuleChain(context, entry, name);
    finallyCallback();
  }

  _addModuleChain(context, entry, name) {
    const module = normalModuleFactory.create({
      context,
      name,
      request: path.join(context, entry)
    });

    module.build(this);

    // 把入口模块添加到入口数组
    this.entries.push(module);
  }

  buildDependecies(module, dependencies) {
    module.dependencies = dependencies.map((data) => {
      const childModule = normalModuleFactory.create(data);
      return childModule.build(this);
    });
  }

  // 创建代码块对应的文件
  createChunkAssets() {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];

      chunk.files = [];
      const file = chunk.name + '.js';
      let source = mainRender({
        entryId: chunk.entryModule.moduleId, // 此代码块的入口模块 id
        modules: chunk.modules
      });
      chunk.files.push(file);
      this.emitAsset(file, source);
    }
  }

  emitAsset(file, source) {
    this.assets[file] = source;
    this.files.push(file);
  }

  // 封包：通过模块依赖生成代码块
  seal(callback) {
    this.hooks.seal.call();
    this.hooks.beforeChunks.call();

    for (let entryModule of this.entries) {
      const chunk = new Chunk(entryModule);
      this.chunks.push(chunk);
      // 只要模块的名字和代码块名字一样，就说明这个模块属于这个代码块
      chunk.modules = this.modules.filter((module) => module.name === chunk.name);
    }

    this.hooks.afterChunks.call();

    this.createChunkAssets();
    callback();
  }
}

module.exports = Compilation;
