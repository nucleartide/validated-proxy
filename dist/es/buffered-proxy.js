"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var has_own_property_1 = require("./utils/has-own-property");
/**
 * If no execution handler is defined, this is the default.
 *
 * @internal
 */
var defaultExecutionHandler = Object.assign;
/**
 * If no error handler is defined, this is the default.
 *
 * @internal
 */
var defaultErrorHandler = function () { }; // tslint:disable-line no-empty
/**
 * A `BufferedProxy` is a wrapper around a target object. Before values are
 * set on the `BufferedProxy`, they are first validated. If the result is valid,
 * we store the value in the cache. If it's not, we store it in our error cache.
 *
 * When ready, the `BufferedProxy` can be flushed, and the cached changes will
 * be set onto the target object with an overridable `executionHandler`.
 */
var BufferedProxy = /** @class */ (function () {
    /**
     * Creates a new instance of `BufferedProxy`.
     *
     * ```ts
     * const user = { name: 'Lauren' };
     * new BufferedProxy(user, bufferOptions);
     * ```
     *
     * @param target
     * @param bufferOptions
     */
    function BufferedProxy(target, _a) {
        var _b = _a === void 0 ? {} : _a, errorHandler = _b.errorHandler, executionHandler = _b.executionHandler;
        this['__cache__'] = Object.create(null);
        this.target = target;
        this.errorHandler = errorHandler || defaultErrorHandler;
        this.executionHandler = executionHandler || defaultExecutionHandler;
        this.bufferedProxy = this;
    }
    Object.defineProperty(BufferedProxy.prototype, "changed", {
        /**
         * Returns cached changes as an object.
         *
         * ```ts
         * bufferedProxy.changed; // { name: 'Lauren' };
         * ```
         */
        get: function () {
            return this.validResults.reduce(function (acc, _a) {
                var key = _a.key, value = _a.value;
                acc[key] = value;
                return acc;
            }, Object.create(null));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferedProxy.prototype, "errored", {
        /**
         * Returns cached errors as an object.
         *
         * ```ts
         * bufferedProxy.errored;
         * {
         *   name: {
         *     value: 'Lauren Elizabeth',
         *     messages: ['Name is too long']
         *   }
         * };
         * ```
         */
        get: function () {
            return this.invalidResults.reduce(function (acc, _a) {
                var key = _a.key, messages = _a.messages, value = _a.value;
                acc[key] = { messages: messages, value: value };
                return acc;
            }, Object.create(null));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferedProxy.prototype, "changes", {
        /**
         * Returns cached changes as an array.
         *
         * ```ts
         * bufferedProxy.changes; // [{ key: 'name', value: 'Lauren' }]
         * ```
         */
        get: function () {
            return this.validResults.map(function (_a) {
                var key = _a.key, value = _a.value;
                return { key: key, value: value };
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferedProxy.prototype, "errors", {
        /**
         * Returns cached errors as an array.
         *
         * ```ts
         * bufferedProxy.errors;
         * [
         *   { key: 'name', messages: ['must be letters'], value: 123 }
         * ]
         * ```
         */
        get: function () {
            return this.invalidResults.map(function (_a) {
                var key = _a.key, messages = _a.messages, value = _a.value;
                return { key: key, messages: messages, value: value };
            });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets a value or error into the cache, after the change has been
     * validated. Invokes the `errorHandler`, if present.
     *
     * ```ts
     * const user = { name: 'Lauren' };
     * const bufferedProxy = new BufferedProxy(user);
     * bufferedProxy.set(
     *   'name',
     *   new ValidationResult('name', 'Lauren Elizabeth', [
     *     {
     *       message: ['name must be greater than 3 characters'],
     *       validation: true
     *     }
     *   ])
     * );
     * bufferedProxy.get('name'); // 'Lauren Elizabeth'
     * ```
     *
     * @param key
     * @param validationResult
     */
    BufferedProxy.prototype.set = function (key, result) {
        if (key === '__cache__') {
            this.bufferedProxy.__cache__ = result;
            return;
        }
        if (result.isInvalid) {
            this.errorHandler(result.messages);
        }
        return this.updateCache(result);
    };
    /**
     * Applies all the changes to the target object with the `executionHanlder`,
     * then resets the cache to an empty state. The default `executionHandler`
     * is `Object.assign`, which mutates the target object directly.
     *
     * ```ts
     * const user = { name: 'Lauren' };
     * const bufferedProxy = new BufferedProxy(user);
     * bufferedProxy.set(\/* ... *\/);
     * bufferedProxy.flush();
     * user.name; // 'Lauren Elizabeth'
     * ```
     */
    BufferedProxy.prototype.flush = function () {
        var flushed = this.executionHandler(this.target, this.changed);
        this.reset();
        return flushed;
    };
    /**
     * Retrieve value or error from cache by key. Returns property on the buffered
     * proxy as a fallback, followed by the target object.
     *
     * ```ts
     * bufferedProxy.get('name'); // 'Lauren'
     * ```
     *
     * @param key
     */
    BufferedProxy.prototype.get = function (key) {
        if (has_own_property_1.default(this.cache, key)) {
            return this.bufferedProxy.cache[key].value;
        }
        if (this[key]) {
            return this[key];
        }
        return this.target[key];
    };
    /**
     * Resets the cache.
     *
     * ```ts
     * bufferedProxy.get('name'); // 'Lauren Elizabeth'
     * bufferedProxy.reset();
     * bufferedProxy.get('name'); // 'Lauren'
     * ```
     */
    BufferedProxy.prototype.reset = function () {
        this.bufferedProxy.__cache__ = Object.create(null);
    };
    Object.defineProperty(BufferedProxy.prototype, "cache", {
        get: function () {
            return this.__cache__;
        },
        enumerable: true,
        configurable: true
    });
    BufferedProxy.prototype.updateCache = function (result) {
        this.bufferedProxy.cache[result.key] = result;
        return result;
    };
    Object.defineProperty(BufferedProxy.prototype, "validResults", {
        get: function () {
            return Object.values(this.cache).filter(function (r) { return r.isValid; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferedProxy.prototype, "invalidResults", {
        get: function () {
            return Object.values(this.cache).filter(function (r) { return r.isInvalid; });
        },
        enumerable: true,
        configurable: true
    });
    return BufferedProxy;
}());
exports.default = BufferedProxy;
//# sourceMappingURL=buffered-proxy.js.map