import { mock, MockProxy } from "jest-mock-extended";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

import { WindowMain } from "../../../main/window.main";
import { ElectronStateService } from "../../services/electron-state.service.abstraction";

import BiometricDarwinMain from "./biometric.darwin.main";
import BiometricWindowsMain from "./biometric.windows.main";
import { BiometricsService } from "./biometrics.service";
import { OsBiometricService } from "./biometrics.service.abstraction";

jest.mock("@bitwarden/desktop-native", () => {
  return {
    biometrics: jest.fn(),
    passwords: jest.fn(),
  };
});

describe("biometrics tests", function () {
  const i18nService = mock<I18nService>();
  const windowMain = mock<WindowMain>();
  const stateService = mock<ElectronStateService>();
  const logService = mock<LogService>();
  const messagingService = mock<MessagingService>();

  it("Should call the platformspecific methods", async () => {
    const sut = new BiometricsService(
      i18nService,
      windowMain,
      stateService,
      logService,
      messagingService,
      process.platform,
    );

    const mockService = mock<OsBiometricService>();
    (sut as any).platformSpecificService = mockService;
    sut.init();
    sut.setEncryptionKeyHalf({ service: "test", key: "test", value: "test" });
    expect(mockService.init).toBeCalled();

    await sut.canAuthBiometric({ service: "test", key: "test", userId: "test" });
    expect(mockService.osSupportsBiometric).toBeCalled();

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
        "win32",
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
        "darwin",
      );
      const internalService = (sut as any).platformSpecificService;
      expect(internalService).not.toBeNull();
      expect(internalService).toBeInstanceOf(BiometricDarwinMain);
    });
  });

  describe("can auth biometric", () => {
    let sut: BiometricsService;
    let innerService: MockProxy<OsBiometricService>;

    beforeEach(() => {
      sut = new BiometricsService(
        i18nService,
        windowMain,
        stateService,
        logService,
        messagingService,
        process.platform,
      );

      innerService = mock();
      (sut as any).platformSpecificService = innerService;
      sut.init();
    });

    it("should return false if client key half is required and not provided", async () => {
      stateService.getBiometricRequirePasswordOnStart.mockResolvedValue(true);

      const result = await sut.canAuthBiometric({ service: "test", key: "test", userId: "test" });

      expect(result).toBe(false);
    });

    it("should call osSupportsBiometric if client key half is provided", async () => {
      sut.setEncryptionKeyHalf({ service: "test", key: "test", value: "test" });
      expect(innerService.init).toBeCalled();

      await sut.canAuthBiometric({ service: "test", key: "test", userId: "test" });
      expect(innerService.osSupportsBiometric).toBeCalled();
    });

    it("should call osSupportBiometric if client key half is not required", async () => {
      stateService.getBiometricRequirePasswordOnStart.mockResolvedValue(false);
      innerService.osSupportsBiometric.mockResolvedValue(true);

      const result = await sut.canAuthBiometric({ service: "test", key: "test", userId: "test" });

      expect(result).toBe(true);
      expect(innerService.osSupportsBiometric).toBeCalled();
    });
  });
});
