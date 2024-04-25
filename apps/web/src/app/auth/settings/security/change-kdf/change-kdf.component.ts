import { Component, OnInit } from "@angular/core";

import { KdfConfigService } from "@bitwarden/common/auth/abstractions/kdf-config.service";
import {
  Argon2KdfConfig,
  KdfConfig,
  PBKDF2KdfConfig,
} from "@bitwarden/common/auth/models/domain/kdf-config";
import {
  DEFAULT_KDF_CONFIG,
  PBKDF2_ITERATIONS,
  ARGON2_ITERATIONS,
  ARGON2_MEMORY,
  ARGON2_PARALLELISM,
  KdfType,
} from "@bitwarden/common/platform/enums";
import { DialogService } from "@bitwarden/components";

import { ChangeKdfConfirmationComponent } from "./change-kdf-confirmation.component";

@Component({
  selector: "app-change-kdf",
  templateUrl: "change-kdf.component.html",
})
export class ChangeKdfComponent implements OnInit {
  kdfConfig: KdfConfig = DEFAULT_KDF_CONFIG;
  kdfType = KdfType;
  kdfOptions: any[] = [];

  // Default values for template
  protected PBKDF2_ITERATIONS = PBKDF2_ITERATIONS;
  protected ARGON2_ITERATIONS = ARGON2_ITERATIONS;
  protected ARGON2_MEMORY = ARGON2_MEMORY;
  protected ARGON2_PARALLELISM = ARGON2_PARALLELISM;

  constructor(
    private dialogService: DialogService,
    private kdfConfigService: KdfConfigService,
  ) {
    this.kdfOptions = [
      { name: "PBKDF2 SHA-256", value: KdfType.PBKDF2_SHA256 },
      { name: "Argon2id", value: KdfType.Argon2id },
    ];
  }

  async ngOnInit() {
    this.kdfConfig = await this.kdfConfigService.getKdfConfig();
  }

  isPBKDF2(t: KdfConfig): t is PBKDF2KdfConfig {
    return t instanceof PBKDF2KdfConfig;
  }

  isArgon2(t: KdfConfig): t is Argon2KdfConfig {
    return t instanceof Argon2KdfConfig;
  }

  async onChangeKdf(newValue: KdfType) {
    if (newValue === KdfType.PBKDF2_SHA256) {
      this.kdfConfig = new PBKDF2KdfConfig();
    } else if (newValue === KdfType.Argon2id) {
      this.kdfConfig = new Argon2KdfConfig();
    } else {
      throw new Error("Unknown KDF type.");
    }
  }

  async openConfirmationModal() {
    this.dialogService.open(ChangeKdfConfirmationComponent, {
      data: {
        kdfConfig: this.kdfConfig,
      },
    });
  }
}
