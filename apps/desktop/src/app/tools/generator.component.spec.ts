import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
// eslint-disable-next-line no-restricted-imports
import { Substitute } from "@fluffy-spoon/substitute";
import { mock, MockProxy } from "jest-mock-extended";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";
import { UsernameGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/username";

import { GeneratorComponent } from "./generator.component";

describe("GeneratorComponent", () => {
  let component: GeneratorComponent;
  let fixture: ComponentFixture<GeneratorComponent>;
  let platformUtilsServiceMock: MockProxy<PlatformUtilsService>;

  beforeEach(() => {
    platformUtilsServiceMock = mock<PlatformUtilsService>();

    TestBed.configureTestingModule({
      declarations: [GeneratorComponent, I18nPipe],
      providers: [
        {
          provide: PasswordGenerationServiceAbstraction,
          useClass: Substitute.for<PasswordGenerationServiceAbstraction>(),
        },
        {
          provide: UsernameGenerationServiceAbstraction,
          useClass: Substitute.for<UsernameGenerationServiceAbstraction>(),
        },
        {
          provide: StateService,
          useClass: Substitute.for<StateService>(),
        },
        {
          provide: PlatformUtilsService,
          useValue: platformUtilsServiceMock,
        },
        {
          provide: I18nService,
          useClass: Substitute.for<I18nService>(),
        },
        {
          provide: ActivatedRoute,
          useClass: Substitute.for<ActivatedRoute>(),
        },
        {
          provide: LogService,
          useClass: Substitute.for<LogService>(),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("usernameTypesLearnMore()", () => {
    it("should call platformUtilsService.launchUri() once", () => {
      component.usernameTypesLearnMore();
      expect(platformUtilsServiceMock.launchUri).toHaveBeenCalledTimes(1);
    });
  });
});
