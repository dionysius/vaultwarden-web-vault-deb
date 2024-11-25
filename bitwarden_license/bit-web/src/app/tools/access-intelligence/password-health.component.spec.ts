import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { mock } from "jest-mock-extended";
import { of } from "rxjs";

import {
  MemberCipherDetailsApiService,
  PasswordHealthService,
} from "@bitwarden/bit-common/tools/reports/risk-insights";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { TableModule } from "@bitwarden/components";
import { TableBodyDirective } from "@bitwarden/components/src/table/table.component";
import { LooseComponentsModule } from "@bitwarden/web-vault/app/shared";
import { PipesModule } from "@bitwarden/web-vault/app/vault/individual-vault/pipes/pipes.module";

import { PasswordHealthComponent } from "./password-health.component";

describe("PasswordHealthComponent", () => {
  let component: PasswordHealthComponent;
  let fixture: ComponentFixture<PasswordHealthComponent>;
  const activeRouteParams = convertToParamMap({ organizationId: "orgId" });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordHealthComponent, PipesModule, TableModule, LooseComponentsModule],
      declarations: [TableBodyDirective],
      providers: [
        { provide: CipherService, useValue: mock<CipherService>() },
        { provide: I18nService, useValue: mock<I18nService>() },
        { provide: AuditService, useValue: mock<AuditService>() },
        { provide: ApiService, useValue: mock<ApiService>() },
        { provide: MemberCipherDetailsApiService, useValue: mock<MemberCipherDetailsApiService>() },
        {
          provide: PasswordStrengthServiceAbstraction,
          useValue: mock<PasswordStrengthServiceAbstraction>(),
        },
        {
          provide: PasswordHealthService,
          useValue: mock<PasswordHealthService>(),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(activeRouteParams),
            url: of([]),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordHealthComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should initialize component", () => {
    expect(component).toBeTruthy();
  });

  it("should call generateReport on init", () => {});
});
