(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath]);
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code);
            })(absRequire,exports,graph[file].code)
            return exports;
        }
        require('./src/index.js')
    })({"./src/index.js":{"deps":{"./add.js":"/Users/lorin/learn-projects/wheel/build-tools/webpack/src/add.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\nvar res = (0, _add[\"default\"])(1, 2);\nconsole.log(res);"},"/Users/lorin/learn-projects/wheel/build-tools/webpack/src/add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar add = function add(a, b) {\n  return a + b;\n};\nvar _default = add;\nexports[\"default\"] = _default;"}})