// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/abstractions/encrypt.service";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { SettingsService } from "@bitwarden/common/services/settings.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("SettingsService", () => {
  let settingsService: SettingsService;

  let cryptoService: SubstituteOf<CryptoService>;
  let encryptService: SubstituteOf<EncryptService>;
  let stateService: SubstituteOf<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    cryptoService = Substitute.for();
    encryptService = Substitute.for();
    stateService = Substitute.for();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    stateService.getSettings().resolves({ equivalentDomains: [["test"], ["domains"]] });
    stateService.activeAccount$.returns(activeAccount);
    stateService.activeAccountUnlocked$.returns(activeAccountUnlocked);
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    settingsService = new SettingsService(stateService);
  });

  afterEach(() => {
    activeAccount.complete();
    activeAccountUnlocked.complete();
  });

  describe("getEquivalentDomains", () => {
    it("returns value", async () => {
      const result = await firstValueFrom(settingsService.settings$);

      expect(result).toEqual({
        equivalentDomains: [["test"], ["domains"]],
      });
    });
  });

  it("setEquivalentDomains", async () => {
    await settingsService.setEquivalentDomains([["test2"], ["domains2"]]);

    stateService.received(1).setSettings(Arg.any());

    expect((await firstValueFrom(settingsService.settings$)).equivalentDomains).toEqual([
      ["test2"],
      ["domains2"],
    ]);
  });

  it("clear", async () => {
    await settingsService.clear();

    stateService.received(1).setSettings(Arg.any(), Arg.any());

    expect(await firstValueFrom(settingsService.settings$)).toEqual({});
  });
});
