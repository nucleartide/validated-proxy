import hasOwnProperty from './utils/has-own-property';
import ValidationResult from './validation-result';

export type BufferErrorHandler = (messages: string[]) => void;
export type BufferExecutionHandler = (
  target: object,
  changes: object
) => object;

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
 * If no execution handler is defined, this is the default.
 *
 * @internal
 */
const defaultExecutionHandler = Object.assign;

/**
 * If no error handler is defined, this is the default.
 *
 * @internal
 */
const defaultErrorHandler = () => {}; // tslint:disable-line no-empty

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
  public errorHandler: BufferErrorHandler;

  /**
   * Overridable execution handler. Invoked when the `BufferedProxy` is flushed.
   */
  public executionHandler: BufferExecutionHandler;

  private target: object;
  private ['__cache__']: IBufferCache = Object.create(null);
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
  constructor(
    target: object,
    { errorHandler, executionHandler }: IBufferOptions = {}
  ) {
    this.target = target;
    this.errorHandler = errorHandler || defaultErrorHandler;
    this.executionHandler = executionHandler || defaultExecutionHandler;
    this.bufferedProxy = this;
  }

  /**
   * Returns cached changes as an object.
   *
   * ```ts
   * bufferedProxy.changed; // { name: 'Lauren' };
   * ```
   */
  public get changed(): object {
    return this.validResults.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, Object.create(null));
  }

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
  public get errored(): object {
    return this.invalidResults.reduce((acc, { key, messages, value }) => {
      acc[key] = { messages, value };
      return acc;
    }, Object.create(null));
  }

  /**
   * Returns cached changes as an array.
   *
   * ```ts
   * bufferedProxy.changes; // [{ key: 'name', value: 'Lauren' }]
   * ```
   */
  public get changes(): IBufferChange[] {
    return this.validResults.map(({ key, value }) => {
      return { key, value };
    });
  }

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
  public get errors(): IBufferError[] {
    return this.invalidResults.map(({ key, messages, value }) => {
      return { key, messages, value };
    });
  }

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
  public set(key: PropertyKey, result: ValidationResult): ValidationResult {
    if (key === '__cache__') {
      this.bufferedProxy.__cache__ = result;
      return;
    }
    if (result.isInvalid) {
      this.errorHandler(result.messages);
    }
    return this.updateCache(result);
  }

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
  public flush(): object {
    const flushed = this.executionHandler(this.target, this.changed);
    this.reset();
    return flushed;
  }

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
  public get(key: PropertyKey) {
    if (hasOwnProperty(this.cache, key)) {
      return this.bufferedProxy.cache[key].value;
    }
    if (this[key]) {
      return this[key];
    }
    return this.target[key];
  }

  /**
   * Resets the cache.
   *
   * ```ts
   * bufferedProxy.get('name'); // 'Lauren Elizabeth'
   * bufferedProxy.reset();
   * bufferedProxy.get('name'); // 'Lauren'
   * ```
   */
  public reset(): void {
    this.bufferedProxy.__cache__ = Object.create(null);
  }

  private get cache() {
    return this.__cache__;
  }

  private updateCache(result: ValidationResult): ValidationResult {
    this.bufferedProxy.cache[result.key] = result;
    return result;
  }

  private get validResults(): ValidationResult[] {
    return Object.values(this.cache).filter(r => r.isValid);
  }

  private get invalidResults(): ValidationResult[] {
    return Object.values(this.cache).filter(r => r.isInvalid);
  }
}
