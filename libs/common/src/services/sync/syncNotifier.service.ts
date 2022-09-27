import { Subject } from "rxjs";

import { SyncNotifierService as SyncNotifierServiceAbstraction } from "../../abstractions/sync/syncNotifier.service.abstraction";
import { SyncEventArgs } from "../../types/syncEventArgs";

/**
 * This class should most likely have 0 dependencies because it will hopefully
 * be rolled into SyncService once upon a time.
 */
export class SyncNotifierService implements SyncNotifierServiceAbstraction {
  private _sync = new Subject<SyncEventArgs>();

  sync$ = this._sync.asObservable();

  next(event: SyncEventArgs): void {
    this._sync.next(event);
  }
}
