import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { Substitute } from "@fluffy-spoon/substitute";
import { mock, MockProxy } from "jest-mock-extended";

import { I18nPipe } from "@bitwarden/angular/pipes/i18n.pipe";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { UsernameGenerationService } from "@bitwarden/common/abstractions/usernameGeneration.service";

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
          provide: PasswordGenerationService,
          useClass: Substitute.for<PasswordGenerationService>(),
        },
        {
          provide: UsernameGenerationService,
          useClass: Substitute.for<UsernameGenerationService>(),
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
