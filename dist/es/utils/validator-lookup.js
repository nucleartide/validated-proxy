"use strict";
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
//# sourceMappingURL=validator-lookup.js.map