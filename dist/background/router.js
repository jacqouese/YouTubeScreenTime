(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('router', factory) :
  (global = global || self, global.router = factory());
}(this, (function () { 'use strict';

  const router = (request, sendResponse) => {
  };

  return router;

})));
