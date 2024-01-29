import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-secrets-manager-content",
  templateUrl: "secrets-manager-content.component.html",
})
export class SecretsManagerContentComponent implements OnInit, OnDestroy {
  header: string;

  private destroy$ = new Subject<void>();

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((queryParameters) => {
      switch (queryParameters.org) {
        case "enterprise":
          this.header = "Secrets Manager for Enterprise";
          break;
        case "free":
          this.header = "Bitwarden Secrets Manager";
          break;
        case "teams":
        case "teamsStarter":
          this.header = "Secrets Manager for Teams";
          break;
      }
    });
  }
}
