import { Observable, combineLatest, concatMap, filter, map, of } from "rxjs";

import {
  StateProvider,
  SingleUserState,
  CombinedState,
  StateUpdateOptions,
} from "../../../platform/state";

import { BufferedKeyDefinition } from "./buffered-key-definition";

/** Stateful storage that overwrites one state with a buffered state.
 *  When a overwrite occurs, the input state is automatically deleted.
 *  @remarks The buffered state can only overwrite non-nullish values. If the
 *   buffer key contains `null` or `undefined`, it will do nothing.
 */
export class BufferedState<Input, Output, Dependency> implements SingleUserState<Output> {
  /**
   * Instantiate a buffered state
   * @param provider constructs the buffer.
   * @param key defines the buffer location.
   * @param output updates when a overwrite occurs
   * @param dependency$ provides data the buffer depends upon to evaluate and
   *   transform its data. If this is omitted, then `true` is injected as
   *   a dependency, which with a default output will trigger a overwrite immediately.
   *
   * @remarks `dependency$` enables overwrite control during dynamic circumstances,
   *   such as when a overwrite should occur only if a user key is available.
   */
  constructor(
    provider: StateProvider,
    private key: BufferedKeyDefinition<Input, Output, Dependency>,
    private output: SingleUserState<Output>,
    dependency$: Observable<Dependency> = null,
  ) {
    this.bufferState = provider.getUser(output.userId, key.toKeyDefinition());

    const watching = [
      this.bufferState.state$,
      this.output.state$,
      dependency$ ?? of(true as unknown as Dependency),
    ] as const;

    this.state$ = combineLatest(watching).pipe(
      concatMap(async ([input, output, dependency]) => {
        const normalized = input ?? null;

        const canOverwrite = normalized !== null && key.shouldOverwrite(dependency);
        if (canOverwrite) {
          await this.updateOutput(dependency);

          // prevent duplicate updates by suppressing the update
          return [false, output] as const;
        }

        return [true, output] as const;
      }),
      filter(([updated]) => updated),
      map(([, output]) => output),
    );

    this.combinedState$ = this.state$.pipe(map((state) => [this.output.userId, state]));

    this.bufferState$ = this.bufferState.state$;
  }

  private bufferState: SingleUserState<Input>;

  private async updateOutput(dependency: Dependency) {
    // retrieve the latest input value
    let input: Input;
    await this.bufferState.update((state) => state, {
      shouldUpdate: (state) => {
        input = state;
        return false;
      },
    });

    // bail if this update lost the race with the last update
    if (input === null) {
      return;
    }

    // destroy invalid data and bail
    if (!(await this.key.isValid(input, dependency))) {
      await this.bufferState.update(() => null);
      return;
    }

    // overwrite anything left to the output; the updates need to be awaited with `Promise.all`
    // so that `inputState.update(() => null)` runs before `shouldUpdate` reads the value (above).
    // This lets the emission from `this.outputState.update` renter the `concatMap`. If the
    // awaits run in sequence, it can win the race and cause a double emission.
    const output = await this.key.map(input, dependency);
    await Promise.all([this.output.update(() => output), this.bufferState.update(() => null)]);

    return;
  }

  /** {@link SingleUserState.userId} */
  get userId() {
    return this.output.userId;
  }

  /** Observes changes to the output state. This updates when the output
   *  state updates, when the buffer is moved to the output, and when `BufferedState.buffer`
   *  is invoked.
   */
  readonly state$: Observable<Output>;

  /** {@link SingleUserState.combinedState$} */
  readonly combinedState$: Observable<CombinedState<Output>>;

  /** Buffers a value state. The buffered state overwrites the output
   *  state when a subscription occurs.
   *  @param value the state to roll over. Setting this to `null` or `undefined`
   *  has no effect.
   */
  async buffer(value: Input): Promise<void> {
    const normalized = value ?? null;
    if (normalized !== null) {
      await this.bufferState.update(() => normalized);
    }
  }

  /** The data presently being buffered. This emits the pending value each time
   *  new buffer data is provided. It emits null when the buffer is empty.
   */
  readonly bufferState$: Observable<Input>;

  /** Updates the output state.
   *  @param configureState a callback that returns an updated output
   *   state. The callback receives the state's present value as its
   *   first argument and the dependencies listed in `options.combinedLatestWith`
   *   as its second argument.
   *  @param options configures how the update is applied. See {@link StateUpdateOptions}.
   */
  update<TCombine>(
    configureState: (state: Output, dependencies: TCombine) => Output,
    options: StateUpdateOptions<Output, TCombine> = null,
  ): Promise<Output> {
    return this.output.update(configureState, options);
  }
}
