(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define('route', ['exports'], factory) :
    (global = global || self, factory(global.route = {}));
}(this, (function (exports) { 'use strict';

    const routes = {};

    const route = (path, action) => {
      return routes[path] = action;
    };

    exports.default = route;
    exports.routes = routes;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
