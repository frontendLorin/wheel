(function (graph) {
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
        require('/Users/lorin/learn-projects/wheel/build-tools/webpack/src/index.js')
    })({"/Users/lorin/learn-projects/wheel/build-tools/webpack/src/index.js":{"deps":{"./add.js":"/Users/lorin/learn-projects/wheel/build-tools/webpack/src/add.js"},"code":"\"use strict\";\n\nvar _add = require(\"./add.js\");\nvar res = (0, _add.add)(1, 2);\nconsole.log(res);"},"/Users/lorin/learn-projects/wheel/build-tools/webpack/src/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.add = void 0;\nvar add = function add(a, b) {\n  return a + b;\n};\nexports.add = add;"}})