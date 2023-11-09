import { Observable } from "rxjs";

export interface DerivedUserState<T> {
  state$: Observable<T>;
}
