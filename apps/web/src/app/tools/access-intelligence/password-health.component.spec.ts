import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { MockProxy, mock } from "jest-mock-extended";
import { of } from "rxjs";

import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { TableModule } from "@bitwarden/components";
import { TableBodyDirective } from "@bitwarden/components/src/table/table.component";

import { LooseComponentsModule } from "../../shared";
import { PipesModule } from "../../vault/individual-vault/pipes/pipes.module";
// eslint-disable-next-line no-restricted-imports
import { cipherData } from "../reports/pages/reports-ciphers.mock";

import { PasswordHealthComponent } from "./password-health.component";

describe("PasswordHealthComponent", () => {
  let component: PasswordHealthComponent;
  let fixture: ComponentFixture<PasswordHealthComponent>;
  let passwordStrengthService: MockProxy<PasswordStrengthServiceAbstraction>;
  let organizationService: MockProxy<OrganizationService>;
  let cipherServiceMock: MockProxy<CipherService>;
  let auditServiceMock: MockProxy<AuditService>;
  const activeRouteParams = convertToParamMap({ organizationId: "orgId" });

  beforeEach(async () => {
    passwordStrengthService = mock<PasswordStrengthServiceAbstraction>();
    auditServiceMock = mock<AuditService>();
    organizationService = mock<OrganizationService>({
      get: jest.fn().mockResolvedValue({ id: "orgId" } as Organization),
    });
    cipherServiceMock = mock<CipherService>({
      getAllFromApiForOrganization: jest.fn().mockResolvedValue(cipherData),
    });

    await TestBed.configureTestingModule({
      imports: [PasswordHealthComponent, PipesModule, TableModule, LooseComponentsModule],
      declarations: [TableBodyDirective],
      providers: [
        { provide: CipherService, useValue: cipherServiceMock },
        { provide: PasswordStrengthServiceAbstraction, useValue: passwordStrengthService },
        { provide: OrganizationService, useValue: organizationService },
        { provide: I18nService, useValue: mock<I18nService>() },
        { provide: AuditService, useValue: auditServiceMock },
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

  it("should populate reportCiphers with ciphers that have password issues", async () => {
    passwordStrengthService.getPasswordStrength.mockReturnValue({ score: 1 } as any);

    auditServiceMock.passwordLeaked.mockResolvedValue(5);

    await component.setCiphers();

    const cipherIds = component.reportCiphers.map((c) => c.id);

    expect(cipherIds).toEqual([
      "cbea34a8-bde4-46ad-9d19-b05001228ab1",
      "cbea34a8-bde4-46ad-9d19-b05001228ab2",
      "cbea34a8-bde4-46ad-9d19-b05001228cd3",
    ]);
    expect(component.reportCiphers.length).toEqual(3);
  });

  it("should correctly populate passwordStrengthMap", async () => {
    passwordStrengthService.getPasswordStrength.mockImplementation((password) => {
      let score = 0;
      if (password === "123") {
        score = 1;
      } else {
        score = 4;
      }
      return { score } as any;
    });

    auditServiceMock.passwordLeaked.mockResolvedValue(0);

    await component.setCiphers();

    expect(component.passwordStrengthMap.size).toBeGreaterThan(0);
    expect(component.passwordStrengthMap.get("cbea34a8-bde4-46ad-9d19-b05001228ab2")).toEqual([
      "veryWeak",
      "danger",
    ]);
    expect(component.passwordStrengthMap.get("cbea34a8-bde4-46ad-9d19-b05001228cd3")).toEqual([
      "veryWeak",
      "danger",
    ]);
  });
});
