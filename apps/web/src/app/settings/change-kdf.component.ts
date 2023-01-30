import { Component, OnInit } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import {
  DEFAULT_KDF_CONFIG,
  DEFAULT_PBKDF2_ITERATIONS,
  DEFAULT_ARGON2_ITERATIONS,
  DEFAULT_ARGON2_MEMORY,
  DEFAULT_ARGON2_PARALLELISM,
  KdfType,
} from "@bitwarden/common/enums/kdfType";
import { KdfConfig } from "@bitwarden/common/models/domain/kdf-config";
import { KdfRequest } from "@bitwarden/common/models/request/kdf.request";

@Component({
  selector: "app-change-kdf",
  templateUrl: "change-kdf.component.html",
})
export class ChangeKdfComponent implements OnInit {
  masterPassword: string;
  kdf = KdfType.PBKDF2_SHA256;
  kdfConfig: KdfConfig = DEFAULT_KDF_CONFIG;
  kdfType = KdfType;
  kdfOptions: any[] = [];
  formPromise: Promise<any>;
  recommendedPbkdf2Iterations = DEFAULT_PBKDF2_ITERATIONS;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private logService: LogService,
    private stateService: StateService
  ) {
    this.kdfOptions = [
      { name: "PBKDF2 SHA-256", value: KdfType.PBKDF2_SHA256 },
      { name: "Argon2id", value: KdfType.Argon2id },
    ];
  }

  async ngOnInit() {
    this.kdf = await this.stateService.getKdfType();
    this.kdfConfig = await this.stateService.getKdfConfig();
  }

  async submit() {
    const hasEncKey = await this.cryptoService.hasEncKey();
    if (!hasEncKey) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("updateKey"));
      return;
    }

    try {
      this.formPromise = this.makeKeyAndSaveAsync();
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("encKeySettingsChanged"),
        this.i18nService.t("logBackIn")
      );
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
    }
  }

  async onChangeKdf(newValue: KdfType) {
    if (newValue === KdfType.PBKDF2_SHA256) {
      this.kdfConfig = new KdfConfig(DEFAULT_PBKDF2_ITERATIONS);
    } else if (newValue === KdfType.Argon2id) {
      this.kdfConfig = new KdfConfig(
        DEFAULT_ARGON2_ITERATIONS,
        DEFAULT_ARGON2_MEMORY,
        DEFAULT_ARGON2_PARALLELISM
      );
    } else {
      throw new Error("Unknown KDF type.");
    }
  }

  private async makeKeyAndSaveAsync() {
    const request = new KdfRequest();
    request.kdf = this.kdf;
    request.kdfIterations = this.kdfConfig.iterations;
    request.kdfMemory = this.kdfConfig.memory;
    request.kdfParallelism = this.kdfConfig.parallelism;
    request.masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, null);
    const email = await this.stateService.getEmail();
    const newKey = await this.cryptoService.makeKey(
      this.masterPassword,
      email,
      this.kdf,
      this.kdfConfig
    );
    request.newMasterPasswordHash = await this.cryptoService.hashPassword(
      this.masterPassword,
      newKey
    );
    const newEncKey = await this.cryptoService.remakeEncKey(newKey);
    request.key = newEncKey[1].encryptedString;

    await this.apiService.postAccountKdf(request);
  }
}
