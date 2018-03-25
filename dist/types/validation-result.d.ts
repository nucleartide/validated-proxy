export interface IValidationMeta {
    validation: boolean;
    message: string;
}
/**
 * Wrapper class for post-validation changes to a `BufferedProxy`. All validator
 * functions return an instance of this class, to allow for a single interface
 * when updating the state of a `BufferedProxy`.
 */
export default class ValidationResult {
    /**
     * The key being validated.
     *
     * ```ts
     * validatedResult.key; // 'name'
     * ```
     */
    key: PropertyKey;
    /**
     * The value being validated.
     *
     * ```ts
     * validatedResult.value; // 'Lauren'
     * ```
     */
    value: any;
    /**
     * Result of the validations.
     *
     * ```ts
     * validationResult.validations;
     * [
     *   { message: 'must be a string', validation: false },
     *   { message: 'must be at least 2 characters', validation: true }
     * ];
     * ```
     */
    validations: IValidationMeta[];
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
    constructor(key: PropertyKey, value: any, validations: IValidationMeta[]);
    /**
     * Validation message for use in case of validation failure.
     *
     * ```ts
     * validationResult.message; // 'key cannot be blank'
     * ```
     */
    readonly messages: string[];
    /**
     * Is the change valid?
     *
     * ```ts
     * validationResult.isValid; // true
     * ```
     */
    readonly isValid: boolean;
    /**
     * Is the change invalid?
     *
     * ```ts
     * validationResult.isInvalid; // true
     * ```
     */
    readonly isInvalid: boolean;
}
