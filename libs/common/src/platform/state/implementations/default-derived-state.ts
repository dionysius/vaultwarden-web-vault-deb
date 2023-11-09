import { Observable, switchMap } from "rxjs";

import { EncryptService } from "../../abstractions/encrypt.service";
import { DerivedUserState } from "../derived-user-state";
import { Converter, DeriveContext, UserState } from "../user-state";

export class DefaultDerivedUserState<TFrom, TTo> implements DerivedUserState<TTo> {
  state$: Observable<TTo>;

  constructor(
    private converter: Converter<TFrom, TTo>,
    private encryptService: EncryptService,
    private userState: UserState<TFrom>
  ) {
    this.state$ = userState.state$.pipe(
      switchMap(async (from) => {
        // TODO: How do I get the key?
        const convertedData = await this.converter(from, new DeriveContext(null, encryptService));
        return convertedData;
      })
    );
  }
}
