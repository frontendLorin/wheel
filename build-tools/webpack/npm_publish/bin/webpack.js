#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const pwd = process.env.PWD;
const config = require(path.resolve(process.env.PWD, 'webpack.config'));
const { getAbsPath } = require('../utils');

/**
 * 获取模块信息
 * @param {String} file
 * @returns {{deps: {}, file: String, code: String}}
 */
const getModuleInfo = (file) => {
  const dirname = path.resolve(pwd, path.dirname(file));
  // 收集模块依赖
  const deps = {};

  // 获取文件内容
  const body = fs.readFileSync(file, 'utf-8');

  // 编译过程： 代码字符串 => ast 抽象语法树对象 => ast 抽象语法树遍历解析 => 代码字符串
  // 将文件内容转化为抽象语法树
  const ast = parser.parse(body, { sourceType: 'module' });

  // 遍历抽象语法树，收集模块依赖
  traverse(ast, {
    // import 节点 visitor
    ImportDeclaration({ node }) {
      const sourcePath = node.source.value;
      const absPath = `${path.resolve(dirname, sourcePath)}`;
      deps[sourcePath] = absPath;
    },
    enter(pathObj) {
      if (pathObj.node.type === 'CallExpression' && pathObj.node.callee.name === 'require') {
        const sourcePath = pathObj.node.arguments[0].value;
        const absPath = `${path.resolve(dirname, sourcePath)}`;
        deps[sourcePath] = absPath;
      }
    }
  });

  // 将抽象语法书转换为 ES5 代码
  const code = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  }).code;

  return {
    deps,
    file,
    code
  };
};

/**
 * 递归获取所有依赖
 * @param {{deps: {}, file: String, code: String}} deps
 * @param {{deps: {}, file: String, code: String}[]} moduleInfoList=[]
 * @returns {{deps: {}, file: String, code: String}[]}
 */
const getDeps = (entryModuleInfo, moduleInfoList = [entryModuleInfo]) => {
  for (let file of Object.values(entryModuleInfo.deps)) {
    const moduleInfo = getModuleInfo(file);

    moduleInfoList.push(moduleInfo);
    getDeps(moduleInfo, moduleInfoList);
  }

  return moduleInfoList;
};

/**
 * 解析文件所有递归以及依赖的依赖，生成依赖图
 * @param {string} file
 * @returns {any}
 */
const parseModules = (file) => {
  const entryModuleInfo = getModuleInfo(file);
  // 存放所有模块信息
  const moduleInfoList = getDeps(entryModuleInfo);
  // 存放输出的依赖图
  const depsGraph = {};

  moduleInfoList.forEach((moduleInfo) => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code
    };
  });

  return depsGraph;
};

/**
 * 打包
 * @param {string} file
 * @returns {string}
 */
function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file));

  return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath]);
            }

            var exports = {};
            var module = {exports: exports};

            (function (require, module, exports, code) {
                eval(code);
            })(absRequire,module,exports,graph[file].code)

            return module.exports;
        }
        require('${file}')
    })(${depsGraph})`;
}

/**
 * 启动打包程序
 * @returns {any}
 */
const bootstrap = () => {
  const content = bundle(getAbsPath(config.entry));
  const outputDir = getAbsPath(config.output.path);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // 写入打包后的内容
  fs.writeFileSync(path.resolve(outputDir, config.output.filename), content);
};

bootstrap();
