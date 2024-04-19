import { EMPTY, Subscription, catchError, filter, from, switchMap } from "rxjs";

import { AccountService } from "../../auth/abstractions/account.service";
import { UserId } from "../../types/guid";
import { CryptoService } from "../abstractions/crypto.service";
import { LogService } from "../abstractions/log.service";
import { KeySuffixOptions } from "../enums";

// TODO: this is a half measure improvement which allows us to reduce some side effects today (cryptoService.getUserKey setting user key in memory if auto key exists)
// but ideally, in the future, we would be able to put this logic into the cryptoService
// after the vault timeout settings service is transitioned to state provider so that
// the getUserKey logic can simply go to the correct location based on the vault timeout settings
// similar to the TokenService (it would either go to secure storage for the auto user key or memory for the user key)

export class UserKeyInitService {
  constructor(
    private accountService: AccountService,
    private cryptoService: CryptoService,
    private logService: LogService,
  ) {}

  // Note: must listen for changes to support account switching
  listenForActiveUserChangesToSetUserKey(): Subscription {
    return this.accountService.activeAccount$
      .pipe(
        filter((activeAccount) => activeAccount != null),
        switchMap((activeAccount) =>
          from(this.setUserKeyInMemoryIfAutoUserKeySet(activeAccount?.id)).pipe(
            catchError((err: unknown) => {
              this.logService.warning(
                `setUserKeyInMemoryIfAutoUserKeySet failed with error: ${err}`,
              );
              // Returning EMPTY to protect observable chain from cancellation in case of error
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();
  }

  private async setUserKeyInMemoryIfAutoUserKeySet(userId: UserId) {
    if (userId == null) {
      return;
    }

    const autoUserKey = await this.cryptoService.getUserKeyFromStorage(
      KeySuffixOptions.Auto,
      userId,
    );
    if (autoUserKey == null) {
      return;
    }

    await this.cryptoService.setUserKey(autoUserKey, userId);
  }
}
