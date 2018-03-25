"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buffered_proxy_1 = require("./buffered-proxy");
var validator_lookup_1 = require("./utils/validator-lookup");
var validation_result_1 = require("./validation-result");
/**
 * Wraps a target object with a `BufferedProxy`. Setters will first invoke a
 * validator function, if found in a supplied validation map. The validator
 * function returns a `ValidatedResult`, and the `BufferedProxy` is set. Getters
 * will forward to the target object, first returning the error, then the
 * change, and finally the original value;
 *
 * If the result is valid, the value is set into the `BufferedProxy`'s internal
 * value cache.
 *
 * If the result is invalid, the value is set into the `BufferedProxy`'s internal
 * error cache.
 *
 * ```ts
 * const user = {
 *   name: 'Billy Bob',
 *   age: 25
 * };
 * const bufferedProxy = validatedProxy(user, {
 *   validations: {
 *     name: [
 *       validatePresence(true),
 *       validateLength({ min: 4 })
 *     ],
 *     age: [
 *       validatePresence(true),
 *       validateNumber({ gte: 18 })
 *     ]
 *   }
 * });
 * bufferedProxy.name = 'Michael Bolton';
 * user.name; // 'Billy Bob'
 * bufferedProxy.flush();
 * user.name; // 'Michael Bolton'
 * ```
 *
 * @param target
 * @param validatedProxyOptions
 */
function validatedProxy(target, _a) {
    var errorHandler = _a.errorHandler, executionHandler = _a.executionHandler, validations = _a.validations;
    var buffer = new buffered_proxy_1.default(target, {
        errorHandler: errorHandler,
        executionHandler: executionHandler
    });
    return new Proxy(buffer, {
        get: function (targetBuffer, key, receiver) {
            return targetBuffer.get(key);
        },
        set: function (targetBuffer, key, value, receiver) {
            var validators = validator_lookup_1.default(validations, key);
            var result = new validation_result_1.default(key, value, validators.map(function (validate) { return validate(key, value, target[key]); }));
            targetBuffer.set(key, result);
            return true;
        }
    });
}
exports.default = validatedProxy;
//# sourceMappingURL=validated-proxy.js.map