import { Component, OnInit } from "@angular/core";

import { KdfConfig } from "@bitwarden/common/auth/models/domain/kdf-config";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
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
  kdf = KdfType.PBKDF2_SHA256;
  kdfConfig: KdfConfig = DEFAULT_KDF_CONFIG;
  kdfType = KdfType;
  kdfOptions: any[] = [];

  // Default values for template
  protected PBKDF2_ITERATIONS = PBKDF2_ITERATIONS;
  protected ARGON2_ITERATIONS = ARGON2_ITERATIONS;
  protected ARGON2_MEMORY = ARGON2_MEMORY;
  protected ARGON2_PARALLELISM = ARGON2_PARALLELISM;

  constructor(
    private stateService: StateService,
    private dialogService: DialogService,
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

  async onChangeKdf(newValue: KdfType) {
    if (newValue === KdfType.PBKDF2_SHA256) {
      this.kdfConfig = new KdfConfig(PBKDF2_ITERATIONS.defaultValue);
    } else if (newValue === KdfType.Argon2id) {
      this.kdfConfig = new KdfConfig(
        ARGON2_ITERATIONS.defaultValue,
        ARGON2_MEMORY.defaultValue,
        ARGON2_PARALLELISM.defaultValue,
      );
    } else {
      throw new Error("Unknown KDF type.");
    }
  }

  async openConfirmationModal() {
    this.dialogService.open(ChangeKdfConfirmationComponent, {
      data: {
        kdf: this.kdf,
        kdfConfig: this.kdfConfig,
      },
    });
  }
}
