import {
  Observer,
  SubjectLike,
  Unsubscribable,
  ReplaySubject,
  filter,
  map,
  Subject,
  takeUntil,
  pairwise,
  combineLatest,
  distinctUntilChanged,
  BehaviorSubject,
  race,
  ignoreElements,
  endWith,
  startWith,
  Observable,
  Subscription,
  last,
  concat,
  combineLatestWith,
  catchError,
  EMPTY,
} from "rxjs";

import { SingleUserState } from "@bitwarden/common/platform/state";

import { WithConstraints } from "../types";

import { IdentityConstraint } from "./identity-state-constraint";
import { isDynamic } from "./state-constraints-dependency";
import { UserStateSubjectDependencies } from "./user-state-subject-dependencies";

/**
 * Adapt a state provider to an rxjs subject.
 *
 * This subject buffers the last value it received in memory. The buffer is erased
 * if the subject receives a complete or error event. It does not persist the buffer.
 *
 * Warning! The user state subject has a synchronous interface, but subscriptions are
 * always asynchronous.
 *
 * @template State the state stored by the subject
 * @template Dependencies use-specific dependencies provided by the user.
 */
export class UserStateSubject<State extends object, Dependencies = null>
  extends Observable<State>
  implements SubjectLike<State>
{
  /**
   * Instantiates the user state subject
   * @param state the backing store of the subject
   * @param dependencies tailor the subject's behavior for a particular
   *   purpose.
   * @param dependencies.when$ blocks updates to the state subject until
   *   this becomes true. When this occurs, only the last-received update
   *   is applied. The blocked update is kept in memory. It does not persist
   *   to disk.
   * @param dependencies.singleUserId$ writes block until the singleUserId$
   *   is available.
   */
  constructor(
    private state: SingleUserState<State>,
    private dependencies: UserStateSubjectDependencies<State, Dependencies>,
  ) {
    super();

    // normalize dependencies
    const when$ = (this.dependencies.when$ ?? new BehaviorSubject(true)).pipe(
      distinctUntilChanged(),
    );
    const userIdAvailable$ = this.dependencies.singleUserId$.pipe(
      startWith(state.userId),
      pairwise(),
      map(([expectedUserId, actualUserId]) => {
        if (expectedUserId === actualUserId) {
          return true;
        } else {
          throw { expectedUserId, actualUserId };
        }
      }),
      distinctUntilChanged(),
    );
    const constraints$ = (
      this.dependencies.constraints$ ?? new BehaviorSubject(new IdentityConstraint<State>())
    ).pipe(
      // FIXME: this should probably log that an error occurred
      catchError(() => EMPTY),
    );

    // normalize input in case this `UserStateSubject` is not the only
    // observer of the backing store
    const input$ = combineLatest([this.input, constraints$]).pipe(
      map(([input, constraints]) => {
        const calibration = isDynamic(constraints) ? constraints.calibrate(input) : constraints;
        const state = calibration.adjust(input);
        return state;
      }),
    );

    // when the output subscription completes, its last-emitted value
    // loops around to the input for finalization
    const finalize$ = this.pipe(
      last(),
      combineLatestWith(constraints$),
      map(([output, constraints]) => {
        const calibration = isDynamic(constraints) ? constraints.calibrate(output) : constraints;
        const state = calibration.fix(output);
        return state;
      }),
    );
    const updates$ = concat(input$, finalize$);

    // observe completion
    const whenComplete$ = when$.pipe(ignoreElements(), endWith(true));
    const inputComplete$ = this.input.pipe(ignoreElements(), endWith(true));
    const userIdComplete$ = this.dependencies.singleUserId$.pipe(ignoreElements(), endWith(true));
    const completion$ = race(whenComplete$, inputComplete$, userIdComplete$);

    // wire output before input so that output normalizes the current state
    // before any `next` value is processed
    this.outputSubscription = this.state.state$
      .pipe(
        combineLatestWith(constraints$),
        map(([rawState, constraints]) => {
          const calibration = isDynamic(constraints)
            ? constraints.calibrate(rawState)
            : constraints;
          const state = calibration.adjust(rawState);
          return {
            constraints: calibration.constraints,
            state,
          };
        }),
      )
      .subscribe(this.output);
    this.inputSubscription = combineLatest([updates$, when$, userIdAvailable$])
      .pipe(
        filter(([_, when]) => when),
        map(([state]) => state),
        takeUntil(completion$),
      )
      .subscribe({
        next: (r) => this.onNext(r),
        error: (e: unknown) => this.onError(e),
        complete: () => this.onComplete(),
      });
  }

  /** The userId to which the subject is bound.
   */
  get userId() {
    return this.state.userId;
  }

  next(value: State) {
    this.input?.next(value);
  }

  error(err: any) {
    this.input?.error(err);
  }

  complete() {
    this.input?.complete();
  }

  /** Subscribe to the subject's event stream
   * @param observer listening for events
   * @returns the subscription
   */
  subscribe(observer?: Partial<Observer<State>> | ((value: State) => void) | null): Subscription {
    return this.output.pipe(map((wc) => wc.state)).subscribe(observer);
  }

  // using subjects to ensure the right semantics are followed;
  // if greater efficiency becomes desirable, consider implementing
  // `SubjectLike` directly
  private input = new Subject<State>();
  private readonly output = new ReplaySubject<WithConstraints<State>>(1);

  /** A stream containing settings and their last-applied constraints. */
  get withConstraints$() {
    return this.output.asObservable();
  }

  private inputSubscription: Unsubscribable;
  private outputSubscription: Unsubscribable;

  private onNext(value: State) {
    const nextValue = this.dependencies.nextValue ?? ((_: State, next: State) => next);
    const shouldUpdate = this.dependencies.shouldUpdate ?? ((_: State) => true);

    this.state
      .update(
        (state, dependencies) => {
          const next = nextValue(state, value, dependencies);
          return next;
        },
        {
          shouldUpdate(current, dependencies) {
            const update = shouldUpdate(current, value, dependencies);
            return update;
          },
          combineLatestWith: this.dependencies.dependencies$,
        },
      )
      .catch((e: any) => this.onError(e));
  }

  private onError(value: any) {
    if (!this.isDisposed) {
      this.output.error(value);
    }

    this.dispose();
  }

  private onComplete() {
    if (!this.isDisposed) {
      this.output.complete();
    }

    this.dispose();
  }

  private get isDisposed() {
    return this.input === null;
  }

  private dispose() {
    if (!this.isDisposed) {
      // clean up internal subscriptions
      this.inputSubscription.unsubscribe();
      this.outputSubscription.unsubscribe();
      this.inputSubscription = null;
      this.outputSubscription = null;

      // drop input to ensure its value is removed from memory
      this.input = null;
    }
  }
}
