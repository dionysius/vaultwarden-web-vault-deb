import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { ButtonModule, DialogService, MenuModule } from "@bitwarden/components";

import { BrowserApi } from "../../../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../../../platform/popup/browser-popup-utils";
import { AddEditQueryParams } from "../add-edit/add-edit-v2.component";
import { AddEditFolderDialogComponent } from "../add-edit-folder-dialog/add-edit-folder-dialog.component";

import { NewItemDropdownV2Component, NewItemInitialValues } from "./new-item-dropdown-v2.component";

describe("NewItemDropdownV2Component", () => {
  let component: NewItemDropdownV2Component;
  let fixture: ComponentFixture<NewItemDropdownV2Component>;
  const open = jest.fn();
  const navigate = jest.fn();

  jest
    .spyOn(BrowserApi, "getTabFromCurrentWindow")
    .mockResolvedValue({ url: "https://example.com" } as chrome.tabs.Tab);

  beforeEach(async () => {
    open.mockClear();
    navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [NewItemDropdownV2Component, MenuModule, ButtonModule, JslibModule, CommonModule],
      providers: [
        { provide: I18nService, useValue: { t: (key: string) => key } },
        { provide: Router, useValue: { navigate } },
      ],
    })
      .overrideProvider(DialogService, { useValue: { open } })
      .compileComponents();

    fixture = TestBed.createComponent(NewItemDropdownV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("opens new folder dialog", () => {
    component.openFolderDialog();

    expect(open).toHaveBeenCalledWith(AddEditFolderDialogComponent);
  });

  describe("new item", () => {
    const emptyParams: AddEditQueryParams = {
      collectionId: undefined,
      organizationId: undefined,
      folderId: undefined,
    };

    beforeEach(() => {
      jest.spyOn(component, "newItemNavigate");
    });

    it("navigates to new login", async () => {
      await component.newItemNavigate(CipherType.Login);

      expect(navigate).toHaveBeenCalledWith(["/add-cipher"], {
        queryParams: {
          type: CipherType.Login.toString(),
          name: "example.com",
          uri: "https://example.com",
          ...emptyParams,
        },
      });
    });

    it("navigates to new card", async () => {
      await component.newItemNavigate(CipherType.Card);

      expect(navigate).toHaveBeenCalledWith(["/add-cipher"], {
        queryParams: { type: CipherType.Card.toString(), ...emptyParams },
      });
    });

    it("navigates to new identity", async () => {
      await component.newItemNavigate(CipherType.Identity);

      expect(navigate).toHaveBeenCalledWith(["/add-cipher"], {
        queryParams: { type: CipherType.Identity.toString(), ...emptyParams },
      });
    });

    it("navigates to new note", async () => {
      await component.newItemNavigate(CipherType.SecureNote);

      expect(navigate).toHaveBeenCalledWith(["/add-cipher"], {
        queryParams: { type: CipherType.SecureNote.toString(), ...emptyParams },
      });
    });

    it("includes initial values", async () => {
      component.initialValues = {
        folderId: "222-333-444",
        organizationId: "444-555-666",
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      await component.newItemNavigate(CipherType.Login);

      expect(navigate).toHaveBeenCalledWith(["/add-cipher"], {
        queryParams: {
          type: CipherType.Login.toString(),
          folderId: "222-333-444",
          organizationId: "444-555-666",
          collectionId: "777-888-999",
          uri: "https://example.com",
          name: "example.com",
        },
      });
    });

    it("does not include name or uri when the extension is popped out", async () => {
      jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(true);

      component.initialValues = {
        folderId: "222-333-444",
        organizationId: "444-555-666",
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      await component.newItemNavigate(CipherType.Login);

      expect(navigate).toHaveBeenCalledWith(["/add-cipher"], {
        queryParams: {
          type: CipherType.Login.toString(),
          folderId: "222-333-444",
          organizationId: "444-555-666",
          collectionId: "777-888-999",
        },
      });
    });
  });
});
