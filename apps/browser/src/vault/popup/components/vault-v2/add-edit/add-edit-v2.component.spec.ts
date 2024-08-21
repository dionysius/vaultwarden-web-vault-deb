import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { mock } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Cipher } from "@bitwarden/common/vault/models/domain/cipher";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CipherFormConfig, CipherFormConfigService, CipherFormMode } from "@bitwarden/vault";

import { BrowserFido2UserInterfaceSession } from "../../../../../autofill/fido2/services/browser-fido2-user-interface.service";
import BrowserPopupUtils from "../../../../../platform/popup/browser-popup-utils";
import { PopupRouterCacheService } from "../../../../../platform/popup/view-cache/popup-router-cache.service";
import { PopupCloseWarningService } from "../../../../../popup/services/popup-close-warning.service";

import { AddEditV2Component } from "./add-edit-v2.component";

// 'qrcode-parser' is used by `BrowserTotpCaptureService` but is an es6 module that jest can't compile.
// Mock the entire module here to prevent jest from throwing an error. I wasn't able to find a way to mock the
// `BrowserTotpCaptureService` where jest would not load the file in the first place.
jest.mock("qrcode-parser", () => {});

describe("AddEditV2Component", () => {
  let component: AddEditV2Component;
  let fixture: ComponentFixture<AddEditV2Component>;

  const buildConfigResponse = { originalCipher: {} } as CipherFormConfig;
  const buildConfig = jest.fn((mode: CipherFormMode) =>
    Promise.resolve({ mode, ...buildConfigResponse }),
  );
  const queryParams$ = new BehaviorSubject({});
  const disable = jest.fn();
  const navigate = jest.fn();
  const back = jest.fn().mockResolvedValue(null);

  beforeEach(async () => {
    buildConfig.mockClear();
    disable.mockClear();
    navigate.mockClear();
    back.mockClear();

    await TestBed.configureTestingModule({
      imports: [AddEditV2Component],
      providers: [
        { provide: PlatformUtilsService, useValue: mock<PlatformUtilsService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
        { provide: PopupRouterCacheService, useValue: { back } },
        { provide: PopupCloseWarningService, useValue: { disable } },
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$ } },
        { provide: I18nService, useValue: { t: (key: string) => key } },
      ],
    })
      .overrideProvider(CipherFormConfigService, {
        useValue: {
          buildConfig,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddEditV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe("query params", () => {
    describe("mode", () => {
      it("sets mode to `add` when no `cipherId` is provided", fakeAsync(() => {
        queryParams$.next({});

        tick();

        expect(buildConfig.mock.lastCall[0]).toBe("add");
        expect(component.config.mode).toBe("add");
      }));

      it("sets mode to `edit` when `params.clone` is not provided", fakeAsync(() => {
        queryParams$.next({ cipherId: "222-333-444-5555", clone: "true" });

        tick();

        expect(buildConfig.mock.lastCall[0]).toBe("clone");
        expect(component.config.mode).toBe("clone");
      }));

      it("sets mode to `edit` when `params.clone` is not provided", fakeAsync(() => {
        buildConfigResponse.originalCipher = { edit: true } as Cipher;
        queryParams$.next({ cipherId: "222-333-444-5555" });

        tick();

        expect(buildConfig.mock.lastCall[0]).toBe("edit");
        expect(component.config.mode).toBe("edit");
      }));

      it("sets mode to `partial-edit` when `config.originalCipher.edit` is false", fakeAsync(() => {
        buildConfigResponse.originalCipher = { edit: false } as Cipher;
        queryParams$.next({ cipherId: "222-333-444-5555" });

        tick();

        expect(buildConfig.mock.lastCall[0]).toBe("edit");
        expect(component.config.mode).toBe("partial-edit");
      }));
    });
  });

  describe("onCipherSaved", () => {
    it("disables warning when in popout", async () => {
      jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValueOnce(true);

      await component.onCipherSaved({ id: "123-456-789" } as CipherView);

      expect(disable).toHaveBeenCalled();
    });

    it("calls `confirmNewCredentialResponse` when in fido2 popout", async () => {
      // @ts-expect-error - `inFido2PopoutWindow` is a private getter, mock the response here
      // for the test rather than setting up the dependencies.
      jest.spyOn(component, "inFido2PopoutWindow", "get").mockReturnValueOnce(true);

      await component.onCipherSaved({ id: "123-456-789" } as CipherView);

      expect(BrowserPopupUtils.inPopout).toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it("closes single action popout", async () => {
      jest.spyOn(BrowserPopupUtils, "inSingleActionPopout").mockReturnValueOnce(true);
      jest.spyOn(BrowserPopupUtils, "closeSingleActionPopout").mockResolvedValue();

      await component.onCipherSaved({ id: "123-456-789" } as CipherView);

      expect(BrowserPopupUtils.closeSingleActionPopout).toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it("navigates to view-cipher for new ciphers", async () => {
      component.config.mode = "add";

      await component.onCipherSaved({ id: "123-456-789" } as CipherView);

      expect(navigate).toHaveBeenCalledWith(["/view-cipher"], {
        replaceUrl: true,
        queryParams: { cipherId: "123-456-789" },
      });
      expect(back).not.toHaveBeenCalled();
    });

    it("navigates to view-cipher for edit ciphers", async () => {
      component.config.mode = "edit";

      await component.onCipherSaved({ id: "123-456-789" } as CipherView);

      expect(navigate).not.toHaveBeenCalled();
      expect(back).toHaveBeenCalled();
    });
  });

  describe("handleBackButton", () => {
    it("disables warning and aborts fido2 popout", async () => {
      // @ts-expect-error - `inFido2PopoutWindow` is a private getter, mock the response here
      // for the test rather than setting up the dependencies.
      jest.spyOn(component, "inFido2PopoutWindow", "get").mockReturnValueOnce(true);
      jest.spyOn(BrowserFido2UserInterfaceSession, "abortPopout");

      await component.handleBackButton();

      expect(disable).toHaveBeenCalled();
      expect(BrowserFido2UserInterfaceSession.abortPopout).toHaveBeenCalled();
      expect(back).not.toHaveBeenCalled();
    });

    it("closes single action popout", async () => {
      jest.spyOn(BrowserPopupUtils, "inSingleActionPopout").mockReturnValueOnce(true);
      jest.spyOn(BrowserPopupUtils, "closeSingleActionPopout").mockResolvedValue();

      await component.handleBackButton();

      expect(BrowserPopupUtils.closeSingleActionPopout).toHaveBeenCalled();
      expect(back).not.toHaveBeenCalled();
    });

    it("navigates the user backwards", async () => {
      await component.handleBackButton();

      expect(back).toHaveBeenCalled();
    });
  });
});
