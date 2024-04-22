export class Lazy<T> {
  private _value: T | undefined = undefined;
  private _isCreated = false;

  constructor(private readonly factory: () => T) {}

  /**
   * Resolves the factory and returns the result. Guaranteed to resolve the value only once.
   *
   * @returns The value produced by your factory.
   */
  get(): T {
    if (!this._isCreated) {
      this._value = this.factory();
      this._isCreated = true;
    }

    return this._value as T;
  }
}
