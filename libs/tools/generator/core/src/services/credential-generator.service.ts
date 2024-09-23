import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  endWith,
  filter,
  firstValueFrom,
  ignoreElements,
  map,
  mergeMap,
  Observable,
  race,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs";
import { Simplify } from "type-fest";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { StateProvider } from "@bitwarden/common/platform/state";
import {
  OnDependency,
  SingleUserDependency,
  UserDependency,
} from "@bitwarden/common/tools/dependencies";
import { isDynamic } from "@bitwarden/common/tools/state/state-constraints-dependency";
import { UserStateSubject } from "@bitwarden/common/tools/state/user-state-subject";

import { Randomizer } from "../abstractions";
import { mapPolicyToConstraints } from "../rx";
import { CredentialGeneratorConfiguration as Configuration } from "../types/credential-generator-configuration";
import { GeneratorConstraints } from "../types/generator-constraints";

type Policy$Dependencies = UserDependency;
type Settings$Dependencies = Partial<UserDependency>;
type Generate$Dependencies = Simplify<Partial<OnDependency> & Partial<UserDependency>> & {
  /** Emits the active website when subscribed.
   *
   *  The generator does not respond to emissions of this interface;
   *  If it is provided, the generator blocks until a value becomes available.
   *  When `website$` is omitted, the generator uses the empty string instead.
   *  When `website$` completes, the generator completes.
   *  When `website$` errors, the generator forwards the error.
   */
  website$?: Observable<string>;
};

export class CredentialGeneratorService {
  constructor(
    private randomizer: Randomizer,
    private stateProvider: StateProvider,
    private policyService: PolicyService,
  ) {}

  /** Generates a stream of credentials
   * @param configuration determines which generator's settings are loaded
   * @param dependencies.on$ when specified, a new credential is emitted when
   *   this emits. Otherwise, a new credential is emitted when the settings
   *   update.
   */
  generate$<Settings extends object, Policy>(
    configuration: Readonly<Configuration<Settings, Policy>>,
    dependencies?: Generate$Dependencies,
  ) {
    // instantiate the engine
    const engine = configuration.engine.create(this.randomizer);

    // stream blocks until all of these values are received
    const website$ = dependencies?.website$ ?? new BehaviorSubject<string>(null);
    const request$ = website$.pipe(map((website) => ({ website })));
    const settings$ = this.settings$(configuration, dependencies);

    // monitor completion
    const requestComplete$ = request$.pipe(ignoreElements(), endWith(true));
    const settingsComplete$ = request$.pipe(ignoreElements(), endWith(true));
    const complete$ = race(requestComplete$, settingsComplete$);

    // generation proper
    const generate$ = (dependencies?.on$ ?? settings$).pipe(
      withLatestFrom(request$, settings$),
      concatMap(([, request, settings]) => engine.generate(request, settings)),
      takeUntil(complete$),
    );

    return generate$;
  }

  /** Get the settings for the provided configuration
   * @param configuration determines which generator's settings are loaded
   * @param dependencies.userId$ identifies the user to which the settings are bound.
   *   If this parameter is not provided, the observable follows the active user and
   *   may not complete.
   * @returns an observable that emits settings
   * @remarks the observable enforces policies on the settings
   */
  settings$<Settings extends object, Policy>(
    configuration: Configuration<Settings, Policy>,
    dependencies?: Settings$Dependencies,
  ) {
    const userId$ = dependencies?.userId$ ?? this.stateProvider.activeUserId$;
    const completion$ = userId$.pipe(ignoreElements(), endWith(true));

    const state$ = userId$.pipe(
      filter((userId) => !!userId),
      distinctUntilChanged(),
      switchMap((userId) => {
        const state$ = this.stateProvider
          .getUserState$(configuration.settings.account, userId)
          .pipe(takeUntil(completion$));

        return state$;
      }),
      map((settings) => settings ?? structuredClone(configuration.settings.initial)),
    );

    const settings$ = combineLatest([state$, this.policy$(configuration, { userId$ })]).pipe(
      map(([settings, policy]) => {
        const calibration = isDynamic(policy) ? policy.calibrate(settings) : policy;
        const adjusted = calibration.adjust(settings);
        return adjusted;
      }),
    );

    return settings$;
  }

  /** Get a subject bound to a specific user's settings
   * @param configuration determines which generator's settings are loaded
   * @param dependencies.singleUserId$ identifies the user to which the settings are bound
   * @returns a promise that resolves with the subject once
   *  `dependencies.singleUserId$` becomes available.
   * @remarks the subject enforces policy for the settings
   */
  async settings<Settings extends object, Policy>(
    configuration: Readonly<Configuration<Settings, Policy>>,
    dependencies: SingleUserDependency,
  ) {
    const userId = await firstValueFrom(
      dependencies.singleUserId$.pipe(filter((userId) => !!userId)),
    );
    const state = this.stateProvider.getUser(userId, configuration.settings.account);
    const constraints$ = this.policy$(configuration, { userId$: dependencies.singleUserId$ });

    const subject = new UserStateSubject(state, { ...dependencies, constraints$ });

    return subject;
  }

  /** Get the policy constraints for the provided configuration
   *  @param dependencies.userId$ determines which user's policy is loaded
   *  @returns an observable that emits the policy once `dependencies.userId$`
   *   and the policy become available.
   */
  policy$<Settings, Policy>(
    configuration: Configuration<Settings, Policy>,
    dependencies: Policy$Dependencies,
  ): Observable<GeneratorConstraints<Settings>> {
    const completion$ = dependencies.userId$.pipe(ignoreElements(), endWith(true));

    const constraints$ = dependencies.userId$.pipe(
      mergeMap((userId) => {
        // complete policy emissions otherwise `mergeMap` holds `policies$` open indefinitely
        const policies$ = this.policyService
          .getAll$(configuration.policy.type, userId)
          .pipe(takeUntil(completion$));
        return policies$;
      }),
      mapPolicyToConstraints(configuration.policy),
    );

    return constraints$;
  }
}
