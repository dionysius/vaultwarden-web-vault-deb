import { map, Observable, of, switchMap } from "rxjs";

import {
  ActiveUserState,
  BILLING_DISK,
  StateProvider,
  UserKeyDefinition,
} from "../../../platform/state";
import { UserId } from "../../../types/guid";
import {
  BillingAccountProfile,
  BillingAccountProfileStateService,
} from "../../abstractions/account/billing-account-profile-state.service";

export const BILLING_ACCOUNT_PROFILE_KEY_DEFINITION = new UserKeyDefinition<BillingAccountProfile>(
  BILLING_DISK,
  "accountProfile",
  {
    deserializer: (billingAccountProfile) => billingAccountProfile,
    clearOn: ["logout"],
  },
);

export class DefaultBillingAccountProfileStateService implements BillingAccountProfileStateService {
  private billingAccountProfileState: ActiveUserState<BillingAccountProfile>;

  hasPremiumFromAnyOrganization$: Observable<boolean>;
  hasPremiumPersonally$: Observable<boolean>;
  hasPremiumFromAnySource$: Observable<boolean>;

  constructor(private readonly stateProvider: StateProvider) {
    this.billingAccountProfileState = stateProvider.getActive(
      BILLING_ACCOUNT_PROFILE_KEY_DEFINITION,
    );

    // Setup an observable that will always track the currently active user
    // but will fallback to emitting null when there is no active user.
    const billingAccountProfileOrNull = stateProvider.activeUserId$.pipe(
      switchMap((userId) =>
        userId != null
          ? stateProvider.getUser(userId, BILLING_ACCOUNT_PROFILE_KEY_DEFINITION).state$
          : of(null),
      ),
    );

    this.hasPremiumFromAnyOrganization$ = billingAccountProfileOrNull.pipe(
      map((billingAccountProfile) => !!billingAccountProfile?.hasPremiumFromAnyOrganization),
    );

    this.hasPremiumPersonally$ = billingAccountProfileOrNull.pipe(
      map((billingAccountProfile) => !!billingAccountProfile?.hasPremiumPersonally),
    );

    this.hasPremiumFromAnySource$ = billingAccountProfileOrNull.pipe(
      map(
        (billingAccountProfile) =>
          billingAccountProfile?.hasPremiumFromAnyOrganization === true ||
          billingAccountProfile?.hasPremiumPersonally === true,
      ),
    );
  }

  async setHasPremium(
    hasPremiumPersonally: boolean,
    hasPremiumFromAnyOrganization: boolean,
    userId: UserId,
  ): Promise<void> {
    await this.stateProvider.getUser(userId, BILLING_ACCOUNT_PROFILE_KEY_DEFINITION).update((_) => {
      return {
        hasPremiumPersonally: hasPremiumPersonally,
        hasPremiumFromAnyOrganization: hasPremiumFromAnyOrganization,
      };
    });
  }
}
