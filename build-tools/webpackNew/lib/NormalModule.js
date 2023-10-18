const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const path = require('path');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');

class NormalModule {
  constructor({ context, name, request }) {
    this.name = name;
    this.context = context;
    this.request = request;
    // 依赖的模块数组
    this.dependencies = [];
    // 模块 id
    this.moduleId;
    // 模块的抽象语法树
    this._ast;
    // 源码
    this._source;
  }

  build(complation) {
    // 读取模块内容
    const originSource = complation.inputFileSystem.readFileSync(this.request, 'utf8');
    const ast = parser.parse(originSource, { sourceType: 'module' });
    const dependencies = [];
    const getDependencyModuleInfo = (moduleName) => {
      // 模块后缀，默认是 .js
      const extName = moduleName.split(path.posix.sep).pop().indexOf('.') === -1 ? '.js' : '';
      // 获取依赖模块的绝对路径
      const dependencyRequest = path.posix.join(path.posix.dirname(this.request), `${moduleName}${extName}`);
      // 获取依赖模块的模块 id
      const dependencyModuleId = `./${path.posix.relative(this.context, dependencyRequest)}`;

      return {
        dependencyRequest,
        dependencyModuleId
      };
    };

    // 遍历抽象语法树，收集模块依赖
    traverse(ast, {
      // import 节点 visitor
      // ImportDeclaration: (nodePath) => {
      //   const { dependencyModuleId, dependencyRequest } = getdependencyModuleInfo(nodePath.node.source.value);
      //   dependencies.push({
      //     name: this.name, // 此模块所属的代码块名字
      //     context: this.context,
      //     request: dependencyRequest
      //   });
      // },
      CallExpression: ({ node }) => {
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__';
          const moduleName = node.arguments[0].value;
          const { dependencyModuleId, dependencyRequest } = getDependencyModuleInfo(moduleName);
          dependencies.push({
            name: this.name, // 此模块所属的代码块名字
            context: this.context,
            request: dependencyRequest
          });
          // 把参数改为新的模块id dependencyModuleId
          node.arguments = [types.stringLiteral(dependencyModuleId)];
        }
      }
    });

    const { code } = generate(ast);
    // 当前模块对应的 ast
    this._ast = ast;
    this.moduleId = `./${path.posix.relative(this.context, this.request)}`;
    // 当前模块对应的源码
    this._source = code;
    // 添加本模块到 complation
    complation.modules.push(this);
    complation._modules[this.request] = this;
    complation.buildDependecies(this, dependencies);

    return this;
  }
}

module.exports = NormalModule;
