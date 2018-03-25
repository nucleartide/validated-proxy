import { IValidationMeta } from '../validation-result';
/**
 * Function signature for validator functions.
 */
export declare type IValidatorFunc = (key: PropertyKey, newValue: any, oldValue: any) => IValidationMeta;
/**
 * A validation map is an object containing the mapping between the target
 * schema and validator functions.
 */
export interface IValidationMap {
    [key: string]: IValidatorFunc | IValidatorFunc[];
}
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
export default function validatorLookup(validations: IValidationMap, key: PropertyKey): IValidatorFunc[];
