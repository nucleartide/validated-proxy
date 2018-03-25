import ValidationResult from './validation-result';
export declare type BufferErrorHandler = (messages: string[]) => void;
export declare type BufferExecutionHandler = (target: object, changes: object) => object;
export interface IBufferError {
    key: PropertyKey;
    value: any;
    messages: string[];
}
export interface IBufferChange {
    key: PropertyKey;
    value: any;
}
export interface IBufferOptions {
    errorHandler?: BufferErrorHandler;
    executionHandler?: BufferExecutionHandler;
}
export interface IBufferCache {
    [key: string]: ValidationResult;
}
/**
 * A `BufferedProxy` is a wrapper around a target object. Before values are
 * set on the `BufferedProxy`, they are first validated. If the result is valid,
 * we store the value in the cache. If it's not, we store it in our error cache.
 *
 * When ready, the `BufferedProxy` can be flushed, and the cached changes will
 * be set onto the target object with an overridable `executionHandler`.
 */
export default class BufferedProxy {
    /**
     * Overridable error handler. Invoked when a `ValidationResult` is invalid.
     */
    errorHandler: BufferErrorHandler;
    /**
     * Overridable execution handler. Invoked when the `BufferedProxy` is flushed.
     */
    executionHandler: BufferExecutionHandler;
    private target;
    private ['__cache__'];
    [key: string]: any;
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
    constructor(target: object, {errorHandler, executionHandler}?: IBufferOptions);
    /**
     * Returns cached changes as an object.
     *
     * ```ts
     * bufferedProxy.changed; // { name: 'Lauren' };
     * ```
     */
    readonly changed: object;
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
    readonly errored: object;
    /**
     * Returns cached changes as an array.
     *
     * ```ts
     * bufferedProxy.changes; // [{ key: 'name', value: 'Lauren' }]
     * ```
     */
    readonly changes: IBufferChange[];
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
    readonly errors: IBufferError[];
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
    set(key: PropertyKey, result: ValidationResult): ValidationResult;
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
    flush(): object;
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
    get(key: PropertyKey): any;
    /**
     * Resets the cache.
     *
     * ```ts
     * bufferedProxy.get('name'); // 'Lauren Elizabeth'
     * bufferedProxy.reset();
     * bufferedProxy.get('name'); // 'Lauren'
     * ```
     */
    reset(): void;
    private readonly cache;
    private updateCache(result);
    private readonly validResults;
    private readonly invalidResults;
}
