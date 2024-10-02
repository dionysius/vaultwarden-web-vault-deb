import {
  concat,
  concatMap,
  connect,
  endWith,
  first,
  ignoreElements,
  map,
  Observable,
  pipe,
  race,
  ReplaySubject,
  takeUntil,
  zip,
} from "rxjs";

import { reduceCollection, distinctIfShallowMatch } from "@bitwarden/common/tools/rx";

import { DefaultPolicyEvaluator } from "./policies";
import { PolicyConfiguration } from "./types";

/** Maps an administrative console policy to a policy evaluator using the provided configuration.
 *  @param configuration the configuration that constructs the evaluator.
 */
export function mapPolicyToEvaluator<Policy, Evaluator>(
  configuration: PolicyConfiguration<Policy, Evaluator>,
) {
  return pipe(
    reduceCollection(configuration.combine, configuration.disabledValue),
    distinctIfShallowMatch(),
    map(configuration.createEvaluator),
  );
}

/** Maps an administrative console policy to constraints using the provided configuration.
 *  @param configuration the configuration that constructs the constraints.
 */
export function mapPolicyToConstraints<Policy, Evaluator>(
  configuration: PolicyConfiguration<Policy, Evaluator>,
) {
  return pipe(
    reduceCollection(configuration.combine, configuration.disabledValue),
    distinctIfShallowMatch(),
    map(configuration.toConstraints),
  );
}

/** Constructs a method that maps a policy to the default (no-op) policy. */
export function newDefaultEvaluator<Target>() {
  return () => {
    return pipe(map((_) => new DefaultPolicyEvaluator<Target>()));
  };
}

/** Create an observable that, once subscribed, emits `true` then completes when
 *   any input completes. If an input is already complete when the subscription
 *   occurs, it emits immediately.
 *  @param watch$ the observable(s) to watch for completion; if an array is passed,
 *   null and undefined members are ignored. If `watch$` is empty, `anyComplete`
 *   will never complete.
 *  @returns An observable that emits `true` when any of its inputs
 *   complete. The observable forwards the first error from its input.
 *  @remarks This method is particularly useful in combination with `takeUntil` and
 *   streams that are not guaranteed to complete on their own.
 */
export function anyComplete(watch$: Observable<any> | Observable<any>[]): Observable<any> {
  if (Array.isArray(watch$)) {
    const completes$ = watch$
      .filter((w$) => !!w$)
      .map((w$) => w$.pipe(ignoreElements(), endWith(true)));
    const completed$ = race(completes$);
    return completed$;
  } else {
    return watch$.pipe(ignoreElements(), endWith(true));
  }
}

/**
 * Create an observable that delays the input stream until all watches have
 *  emitted a value. The watched values are not included in the source stream.
 *  The last emission from the source is output when all the watches have
 *  emitted at least once.
 * @param watch$ the observable(s) to watch for readiness. If `watch$` is empty,
 *  `ready` will never emit.
 * @returns An observable that emits when the source stream emits. The observable
 *   errors if one of its watches completes before emitting. It also errors if one
 *   of its watches errors.
 */
export function ready<T>(watch$: Observable<any> | Observable<any>[]) {
  const watching$ = Array.isArray(watch$) ? watch$ : [watch$];
  return pipe(
    connect<T, Observable<T>>((source$) => {
      // this subscription is safe because `source$` connects only after there
      // is an external subscriber.
      const source = new ReplaySubject<T>(1);
      source$.subscribe(source);

      // `concat` is subscribed immediately after it's returned, at which point
      // `zip` blocks until all items in `watching$` are ready. If that occurs
      // after `source$` is hot, then the replay subject sends the last-captured
      // emission through immediately. Otherwise, `ready` waits for the next
      // emission
      return concat(zip(watching$).pipe(first(), ignoreElements()), source).pipe(
        takeUntil(anyComplete(source)),
      );
    }),
  );
}

/**
 * Create an observable that emits the latest value of the source stream
 *  when `watch$` emits. If `watch$` emits before the stream emits, then
 *  an emission occurs as soon as a value becomes ready.
 * @param watch$ the observable that triggers emissions
 * @returns An observable that emits when `watch$` emits. The observable
 *  errors if its source stream errors. It also errors if `on` errors. It
 *  completes if its watch completes.
 *
 * @remarks This works like `audit`, but it repeats emissions when
 *  watch$ fires.
 */
export function on<T>(watch$: Observable<any>) {
  return pipe(
    connect<T, Observable<T>>((source$) => {
      const source = new ReplaySubject<T>(1);
      source$.subscribe(source);

      return watch$
        .pipe(
          ready(source),
          concatMap(() => source.pipe(first())),
        )
        .pipe(takeUntil(anyComplete(source)));
    }),
  );
}
