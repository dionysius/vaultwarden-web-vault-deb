import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { BehaviorSubject, distinctUntilChanged, map, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserId } from "@bitwarden/common/types/guid";
import {
  CardComponent,
  IconButtonModule,
  NoItemsModule,
  SectionComponent,
  SectionHeaderComponent,
} from "@bitwarden/components";
import { GeneratedCredential, GeneratorHistoryService } from "@bitwarden/generator-history";

@Component({
  standalone: true,
  selector: "bit-credential-generator-history",
  templateUrl: "credential-generator-history.component.html",
  imports: [
    CommonModule,
    IconButtonModule,
    NoItemsModule,
    JslibModule,
    RouterLink,
    CardComponent,
    SectionComponent,
    SectionHeaderComponent,
  ],
})
export class CredentialGeneratorHistoryComponent {
  protected readonly userId$ = new BehaviorSubject<UserId>(null);
  protected readonly credentials$ = new BehaviorSubject<GeneratedCredential[]>([]);

  constructor(
    private accountService: AccountService,
    private history: GeneratorHistoryService,
  ) {
    this.accountService.activeAccount$
      .pipe(
        takeUntilDestroyed(),
        map(({ id }) => id),
        distinctUntilChanged(),
      )
      .subscribe(this.userId$);

    this.userId$
      .pipe(
        takeUntilDestroyed(),
        switchMap((id) => id && this.history.credentials$(id)),
        map((credentials) => credentials),
      )
      .subscribe(this.credentials$);
  }
}
