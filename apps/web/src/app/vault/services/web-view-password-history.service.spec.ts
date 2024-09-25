import { Overlay } from "@angular/cdk/overlay";
import { TestBed } from "@angular/core/testing";

import { CipherId } from "@bitwarden/common/types/guid";
import { DialogService } from "@bitwarden/components";

import { openPasswordHistoryDialog } from "../individual-vault/password-history.component";

import { WebViewPasswordHistoryService } from "./web-view-password-history.service";

jest.mock("../individual-vault/password-history.component", () => ({
  openPasswordHistoryDialog: jest.fn(),
}));

describe("WebViewPasswordHistoryService", () => {
  let service: WebViewPasswordHistoryService;
  let dialogService: DialogService;

  beforeEach(async () => {
    const mockDialogService = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        WebViewPasswordHistoryService,
        { provide: DialogService, useValue: mockDialogService },
        Overlay,
      ],
    }).compileComponents();

    service = TestBed.inject(WebViewPasswordHistoryService);
    dialogService = TestBed.inject(DialogService);
  });

  describe("viewPasswordHistory", () => {
    it("calls openPasswordHistoryDialog with the correct parameters", async () => {
      const mockCipherId = "cipher-id" as CipherId;
      await service.viewPasswordHistory(mockCipherId);
      expect(openPasswordHistoryDialog).toHaveBeenCalledWith(dialogService, {
        data: { cipherId: mockCipherId },
      });
    });
  });
});
