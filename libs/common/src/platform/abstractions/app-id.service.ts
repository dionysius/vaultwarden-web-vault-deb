import { Observable } from "rxjs";

export abstract class AppIdService {
  abstract appId$: Observable<string>;
  abstract anonymousAppId$: Observable<string>;
  abstract getAppId(): Promise<string>;
  abstract getAnonymousAppId(): Promise<string>;
}
