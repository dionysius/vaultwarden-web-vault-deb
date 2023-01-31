import { Observable } from "rxjs";

import { SyncEventArgs } from "../../types/sync-event-args";

export abstract class SyncNotifierService {
  sync$: Observable<SyncEventArgs>;
  next: (event: SyncEventArgs) => void;
}
