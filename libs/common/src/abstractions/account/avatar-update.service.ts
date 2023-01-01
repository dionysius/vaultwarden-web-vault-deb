import { Observable } from "rxjs";

import { ProfileResponse } from "../../models/response/profile.response";
export abstract class AvatarUpdateService {
  avatarUpdate$ = new Observable<string | null>();
  abstract pushUpdate(color: string): Promise<ProfileResponse | void>;
  abstract loadColorFromState(): Promise<string | null>;
}
