import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CryptoService } from "../platform/abstractions/crypto.service";
import { EncryptService } from "../platform/abstractions/encrypt.service";
import { StateService } from "../platform/abstractions/state.service";
import { ContainerService } from "../platform/services/container.service";

import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  let settingsService: SettingsService;

  let cryptoService: MockProxy<CryptoService>;
  let encryptService: MockProxy<EncryptService>;
  let stateService: MockProxy<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  const mockEquivalentDomains = [
    ["example.com", "exampleapp.com", "example.co.uk", "ejemplo.es"],
    ["bitwarden.com", "bitwarden.co.uk", "sm-bitwarden.com"],
    ["example.co.uk", "exampleapp.co.uk"],
  ];

  beforeEach(() => {
    cryptoService = mock<CryptoService>();
    encryptService = mock<EncryptService>();
    stateService = mock<StateService>();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    stateService.getSettings.mockResolvedValue({ equivalentDomains: mockEquivalentDomains });
    stateService.activeAccount$ = activeAccount;
    stateService.activeAccountUnlocked$ = activeAccountUnlocked;
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    settingsService = new SettingsService(stateService);
  });

  afterEach(() => {
    activeAccount.complete();
    activeAccountUnlocked.complete();
  });

  describe("getEquivalentDomains", () => {
    it("returns all equivalent domains for a URL", async () => {
      const actual = settingsService.getEquivalentDomains("example.co.uk");
      const expected = new Set([
        "example.com",
        "exampleapp.com",
        "example.co.uk",
        "ejemplo.es",
        "exampleapp.co.uk",
      ]);
      expect(actual).toEqual(expected);
    });

    it("returns an empty set if there are no equivalent domains", () => {
      const actual = settingsService.getEquivalentDomains("asdf");
      expect(actual).toEqual(new Set());
    });
  });

  it("setEquivalentDomains", async () => {
    await settingsService.setEquivalentDomains([["test2"], ["domains2"]]);

    expect(stateService.setSettings).toBeCalledTimes(1);

    expect((await firstValueFrom(settingsService.settings$)).equivalentDomains).toEqual([
      ["test2"],
      ["domains2"],
    ]);
  });

  it("clear", async () => {
    await settingsService.clear();

    expect(stateService.setSettings).toBeCalledTimes(1);

    expect(await firstValueFrom(settingsService.settings$)).toEqual({});
  });
});
