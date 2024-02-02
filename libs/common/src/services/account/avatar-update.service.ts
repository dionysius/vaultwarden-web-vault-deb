import { BehaviorSubject, Observable } from "rxjs";

import { AvatarUpdateService as AvatarUpdateServiceAbstraction } from "../../abstractions/account/avatar-update.service";
import { ApiService } from "../../abstractions/api.service";
import { UpdateAvatarRequest } from "../../models/request/update-avatar.request";
import { ProfileResponse } from "../../models/response/profile.response";
import { StateService } from "../../platform/abstractions/state.service";

export class AvatarUpdateService implements AvatarUpdateServiceAbstraction {
  private _avatarUpdate$ = new BehaviorSubject<string | null>(null);
  avatarUpdate$: Observable<string | null> = this._avatarUpdate$.asObservable();

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
  ) {
    // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.loadColorFromState();
  }

  loadColorFromState(): Promise<string | null> {
    return this.stateService.getAvatarColor().then((color) => {
      this._avatarUpdate$.next(color);
      return color;
    });
  }

  pushUpdate(color: string | null): Promise<ProfileResponse | void> {
    return this.apiService.putAvatar(new UpdateAvatarRequest(color)).then((response) => {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.stateService.setAvatarColor(response.avatarColor);
      this._avatarUpdate$.next(response.avatarColor);
    });
  }
}
