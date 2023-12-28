// eslint-disable-next-line no-restricted-imports
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { mock } from "jest-mock-extended";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/vault";

import { InactiveTwoFactorReportComponent } from "./inactive-two-factor-report.component";
import { cipherData } from "./reports-ciphers.mock";

describe("InactiveTwoFactorReportComponent", () => {
  let component: InactiveTwoFactorReportComponent;
  let fixture: ComponentFixture<InactiveTwoFactorReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InactiveTwoFactorReportComponent, I18nPipe],
      providers: [
        {
          provide: CipherService,
          useValue: mock<CipherService>(),
        },
        {
          provide: OrganizationService,
          useValue: mock<OrganizationService>(),
        },
        {
          provide: ModalService,
          useValue: mock<ModalService>(),
        },
        {
          provide: LogService,
          useValue: mock<LogService>(),
        },
        {
          provide: PasswordRepromptService,
          useValue: mock<PasswordRepromptService>(),
        },
        {
          provide: I18nService,
          useValue: mock<I18nService>(),
        },
      ],
      schemas: [],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactiveTwoFactorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should initialize component", () => {
    expect(component).toBeTruthy();
  });

  it('should get only ciphers with domains in the 2fa directory that they have "Can Edit" access to', async () => {
    const expectedIdOne: any = "cbea34a8-bde4-46ad-9d19-b05001228xy4";
    const expectedIdTwo: any = "cbea34a8-bde4-46ad-9d19-b05001227nm5";
    component.services.set(
      "101domain.com",
      "https://help.101domain.com/account-management/account-security/enabling-disabling-two-factor-verification",
    );
    component.services.set(
      "123formbuilder.com",
      "https://www.123formbuilder.com/docs/multi-factor-authentication-login",
    );

    jest.spyOn(component as any, "getAllCiphers").mockReturnValue(Promise.resolve<any>(cipherData));
    await component.setCiphers();

    expect(component.ciphers.length).toEqual(2);
    expect(component.ciphers[0].id).toEqual(expectedIdOne);
    expect(component.ciphers[0].edit).toEqual(true);
    expect(component.ciphers[1].id).toEqual(expectedIdTwo);
    expect(component.ciphers[1].edit).toEqual(true);
  });
});
