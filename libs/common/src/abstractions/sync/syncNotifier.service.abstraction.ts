import { Observable } from "rxjs";

import { SyncEventArgs } from "../../types/syncEventArgs";

export abstract class SyncNotifierService {
  sync$: Observable<SyncEventArgs>;
  next: (event: SyncEventArgs) => void;
}
