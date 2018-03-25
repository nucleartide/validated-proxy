(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.validatedProxy = {})));
}(this, (function (exports) { 'use strict';

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var hasOwnProperty_1 = createCommonjsModule(function (module, exports) {
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

});

unwrapExports(hasOwnProperty_1);

var bufferedProxy = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

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
        if (hasOwnProperty_1.default(this.cache, key)) {
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

});

unwrapExports(bufferedProxy);

var validatorLookup_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * If no validator is found, this is the default message returned by the
 * validator function.
 *
 * @internal
 */
exports.defaultValidatorMessage = 'No validator found';
/**
 * If no validator is found, this is the default validation returned by the
 * validator function.
 *
 * @internal
 */
exports.defaultValidatorValidation = true;
/**
 * If no validator is found, this is the default validator function.
 *
 * @internal
 */
exports.defaultValidator = function (key, value, oldValue) {
    return {
        message: exports.defaultValidatorMessage,
        validation: exports.defaultValidatorValidation
    };
};
/**
 * Looks up validator function(s) from a validator map. If none are found, fall
 * back to the `defaultValidator`.
 *
 * ```ts
 * const original = { foo: null };
 * const validationMap = {
 *   foo: validatePresence(),
 *   bar: [
 *     validatePresence(),
 *     validateLength({ gt: 2 })
 *   ]
 * };
 * validatorLookup(validationMap, 'foo'); // IValidatorFunc[]
 * ```
 *
 * @param validations
 * @param key
 */
function validatorLookup(validations, key) {
    var validator = validations[key] || exports.defaultValidator;
    return Array.isArray(validator) ? validator : [validator];
}
exports.default = validatorLookup;

});

unwrapExports(validatorLookup_1);
var validatorLookup_2 = validatorLookup_1.defaultValidatorMessage;
var validatorLookup_3 = validatorLookup_1.defaultValidatorValidation;
var validatorLookup_4 = validatorLookup_1.defaultValidator;

var validationResult = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wrapper class for post-validation changes to a `BufferedProxy`. All validator
 * functions return an instance of this class, to allow for a single interface
 * when updating the state of a `BufferedProxy`.
 */
var ValidationResult = /** @class */ (function () {
    /**
     * Creates a new instance of `ValidationResult`.
     *
     * ```ts
     * new ValidationResult('name', 123, [
     *   { message: 'must be a string', validation: false },
     *   { message: 'must be at least 2 characters', validation: true }
     * ]);
     * ```
     *
     * @param value
     * @param meta
     */
    function ValidationResult(key, value, validations) {
        this.key = key;
        this.value = value;
        this.validations = validations;
    }
    Object.defineProperty(ValidationResult.prototype, "messages", {
        /**
         * Validation message for use in case of validation failure.
         *
         * ```ts
         * validationResult.message; // 'key cannot be blank'
         * ```
         */
        get: function () {
            return this.validations.map(function (v) { return v.message; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidationResult.prototype, "isValid", {
        /**
         * Is the change valid?
         *
         * ```ts
         * validationResult.isValid; // true
         * ```
         */
        get: function () {
            return this.validations.every(function (v) { return v.validation === true; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ValidationResult.prototype, "isInvalid", {
        /**
         * Is the change invalid?
         *
         * ```ts
         * validationResult.isInvalid; // true
         * ```
         */
        get: function () {
            return !this.isValid;
        },
        enumerable: true,
        configurable: true
    });
    return ValidationResult;
}());
exports.default = ValidationResult;

});

unwrapExports(validationResult);

var validatedProxy_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



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
    var buffer = new bufferedProxy.default(target, {
        errorHandler: errorHandler,
        executionHandler: executionHandler
    });
    return new Proxy(buffer, {
        get: function (targetBuffer, key, receiver) {
            return targetBuffer.get(key);
        },
        set: function (targetBuffer, key, value, receiver) {
            var validators = validatorLookup_1.default(validations, key);
            var result = new validationResult.default(key, value, validators.map(function (validate) { return validate(key, value, target[key]); }));
            targetBuffer.set(key, result);
            return true;
        }
    });
}
exports.default = validatedProxy;

});

unwrapExports(validatedProxy_1);

var es = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.BufferedProxy = bufferedProxy.default;

exports.validatedProxy = validatedProxy_1.default;

exports.ValidationResult = validationResult.default;

});

var index = unwrapExports(es);
var es_1 = es.BufferedProxy;
var es_2 = es.validatedProxy;
var es_3 = es.ValidationResult;

exports['default'] = index;
exports.BufferedProxy = es_1;
exports.validatedProxy = es_2;
exports.ValidationResult = es_3;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=validated-proxy.umd.js.map
