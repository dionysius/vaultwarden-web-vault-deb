import { mock } from "jest-mock-extended";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

import { WindowMain } from "../window.main";

import BiometricDarwinMain from "./biometric.darwin.main";
import BiometricWindowsMain from "./biometric.windows.main";
import { BiometricsService } from "./biometrics.service";
import { BiometricsServiceAbstraction } from "./biometrics.service.abstraction";

jest.mock("@bitwarden/desktop-native", () => {
  return {
    biometrics: jest.fn(),
    passwords: jest.fn(),
  };
});

describe("biometrics tests", function () {
  const i18nService = mock<I18nService>();
  const windowMain = mock<WindowMain>();
  const stateService = mock<StateService>();
  const logService = mock<LogService>();
  const messagingService = mock<MessagingService>();

  it("Should call the platformspecific methods", () => {
    const sut = new BiometricsService(
      i18nService,
      windowMain,
      stateService,
      logService,
      messagingService,
      process.platform
    );

    const mockService = mock<BiometricsServiceAbstraction>();
    (sut as any).platformSpecificService = mockService;
    sut.init();
    expect(mockService.init).toBeCalled();

    sut.supportsBiometric();
    expect(mockService.supportsBiometric).toBeCalled();

    sut.authenticateBiometric();
    expect(mockService.authenticateBiometric).toBeCalled();
  });

  describe("Should create a platform specific service", function () {
    it("Should create a biometrics service specific for Windows", () => {
      const sut = new BiometricsService(
        i18nService,
        windowMain,
        stateService,
        logService,
        messagingService,
        "win32"
      );

      const internalService = (sut as any).platformSpecificService;
      expect(internalService).not.toBeNull();
      expect(internalService).toBeInstanceOf(BiometricWindowsMain);
    });

    it("Should create a biometrics service specific for MacOs", () => {
      const sut = new BiometricsService(
        i18nService,
        windowMain,
        stateService,
        logService,
        messagingService,
        "darwin"
      );
      const internalService = (sut as any).platformSpecificService;
      expect(internalService).not.toBeNull();
      expect(internalService).toBeInstanceOf(BiometricDarwinMain);
    });
  });
});
