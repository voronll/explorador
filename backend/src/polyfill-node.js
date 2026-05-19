/**
 * NeDB 1.x usa util.is* removidos no Node.js 22+.
 * Este polyfill deve ser carregado antes de qualquer require('nedb').
 */
const util = require('util')

const polyfills = {
  isDate: (v) => v instanceof Date,
  isRegExp: (v) => v instanceof RegExp,
  isArray: Array.isArray,
  isBoolean: (v) => typeof v === 'boolean',
  isBuffer: (v) => Buffer.isBuffer(v),
  isError: (v) => v instanceof Error,
  isFunction: (v) => typeof v === 'function',
  isNull: (v) => v === null,
  isNullOrUndefined: (v) => v == null,
  isNumber: (v) => typeof v === 'number',
  isObject: (v) => v !== null && typeof v === 'object',
  isPrimitive: (v) =>
    v === null || (typeof v !== 'object' && typeof v !== 'function'),
  isString: (v) => typeof v === 'string',
  isSymbol: (v) => typeof v === 'symbol',
  isUndefined: (v) => v === undefined,
}

for (const [chave, fn] of Object.entries(polyfills)) {
  if (typeof util[chave] !== 'function') {
    util[chave] = fn
  }
}
