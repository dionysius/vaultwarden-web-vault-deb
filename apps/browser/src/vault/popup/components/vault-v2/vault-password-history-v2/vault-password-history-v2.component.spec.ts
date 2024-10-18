import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { mock } from "jest-mock-extended";
import { Subject } from "rxjs";

import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";

import { PopupRouterCacheService } from "../../../../../platform/popup/view-cache/popup-router-cache.service";

import { PasswordHistoryV2Component } from "./vault-password-history-v2.component";

describe("PasswordHistoryV2Component", () => {
  let component: PasswordHistoryV2Component;
  let fixture: ComponentFixture<PasswordHistoryV2Component>;
  const params$ = new Subject();
  const back = jest.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    back.mockClear();

    await TestBed.configureTestingModule({
      imports: [PasswordHistoryV2Component],
      providers: [
        { provide: WINDOW, useValue: window },
        { provide: PlatformUtilsService, useValue: mock<PlatformUtilsService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
        { provide: CipherService, useValue: mock<CipherService>() },
        { provide: AccountService, useValue: mock<AccountService>() },
        { provide: PopupRouterCacheService, useValue: { back } },
        { provide: ActivatedRoute, useValue: { queryParams: params$ } },
        { provide: I18nService, useValue: { t: (key: string) => key } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordHistoryV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("sets the cipherId from the params", () => {
    params$.next({ cipherId: "444-33-33-1111" });

    expect(component["cipherId"]).toBe("444-33-33-1111");
  });

  it("navigates back when a cipherId is not in the params", () => {
    params$.next({});

    expect(back).toHaveBeenCalledTimes(1);
  });
});
