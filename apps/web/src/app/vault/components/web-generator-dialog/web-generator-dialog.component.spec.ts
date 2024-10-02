import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  PasswordGenerationServiceAbstraction,
  UsernameGenerationServiceAbstraction,
} from "@bitwarden/generator-legacy";
import { CipherFormGeneratorComponent } from "@bitwarden/vault";

import {
  WebVaultGeneratorDialogAction,
  WebVaultGeneratorDialogComponent,
  WebVaultGeneratorDialogParams,
} from "./web-generator-dialog.component";

describe("WebVaultGeneratorDialogComponent", () => {
  let component: WebVaultGeneratorDialogComponent;
  let fixture: ComponentFixture<WebVaultGeneratorDialogComponent>;

  let dialogRef: MockProxy<DialogRef<any>>;
  let mockI18nService: MockProxy<I18nService>;
  let passwordOptionsSubject: BehaviorSubject<any>;
  let usernameOptionsSubject: BehaviorSubject<any>;
  let mockPasswordGenerationService: MockProxy<PasswordGenerationServiceAbstraction>;
  let mockUsernameGenerationService: MockProxy<UsernameGenerationServiceAbstraction>;

  beforeEach(async () => {
    dialogRef = mock<DialogRef<any>>();
    mockI18nService = mock<I18nService>();
    passwordOptionsSubject = new BehaviorSubject([{ type: "password" }]);
    usernameOptionsSubject = new BehaviorSubject([{ type: "username" }]);

    mockPasswordGenerationService = mock<PasswordGenerationServiceAbstraction>();
    mockPasswordGenerationService.getOptions$.mockReturnValue(
      passwordOptionsSubject.asObservable(),
    );

    mockUsernameGenerationService = mock<UsernameGenerationServiceAbstraction>();
    mockUsernameGenerationService.getOptions$.mockReturnValue(
      usernameOptionsSubject.asObservable(),
    );

    const mockDialogData: WebVaultGeneratorDialogParams = { type: "password" };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, WebVaultGeneratorDialogComponent],
      providers: [
        {
          provide: DialogRef,
          useValue: dialogRef,
        },
        {
          provide: DIALOG_DATA,
          useValue: mockDialogData,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: PlatformUtilsService,
          useValue: mock<PlatformUtilsService>(),
        },
        {
          provide: PasswordGenerationServiceAbstraction,
          useValue: mockPasswordGenerationService,
        },
        {
          provide: UsernameGenerationServiceAbstraction,
          useValue: mockUsernameGenerationService,
        },
        {
          provide: CipherFormGeneratorComponent,
          useValue: {
            passwordOptions$: passwordOptionsSubject.asObservable(),
            usernameOptions$: usernameOptionsSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WebVaultGeneratorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("initializes without errors", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("closes the dialog with 'canceled' result when close is called", () => {
    const closeSpy = jest.spyOn(dialogRef, "close");

    (component as any).close();

    expect(closeSpy).toHaveBeenCalledWith({
      action: WebVaultGeneratorDialogAction.Canceled,
    });
  });

  it("closes the dialog with 'selected' result when selectValue is called", () => {
    const closeSpy = jest.spyOn(dialogRef, "close");
    const generatedValue = "generated-value";
    component.onValueGenerated(generatedValue);

    (component as any).selectValue();

    expect(closeSpy).toHaveBeenCalledWith({
      action: WebVaultGeneratorDialogAction.Selected,
      generatedValue: generatedValue,
    });
  });

  it("updates generatedValue when onValueGenerated is called", () => {
    const generatedValue = "new-generated-value";
    component.onValueGenerated(generatedValue);

    expect((component as any).generatedValue).toBe(generatedValue);
  });
});
