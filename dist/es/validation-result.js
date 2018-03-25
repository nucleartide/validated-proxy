"use strict";
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
//# sourceMappingURL=validation-result.js.map