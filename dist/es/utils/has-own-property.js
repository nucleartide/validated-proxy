"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Shorthand for `Object.prototype.hasOwnProperty`. Returns a boolean indicating
 * whether the object has the specified property as own (not inherited)
 * property. Useful when the object was created with `Object.create(null)`.
 *
 * ```ts
 * hasOwnProperty({ foo: 1 }, 'foo'); // true
 * ```
 *
 * @param obj
 * @param args
 */
function hasOwnProperty(obj) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return Object.prototype.hasOwnProperty.apply(obj, args);
}
exports.default = hasOwnProperty;
//# sourceMappingURL=has-own-property.js.map