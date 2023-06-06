import { Directive, OnInit } from "@angular/core";

import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { ModalRef } from "./modal/modal.ref";

@Directive()
export class SetPinComponent implements OnInit {
  pin = "";
  showPin = false;
  masterPassOnRestart = true;
  showMasterPassOnRestart = true;

  constructor(
    private modalRef: ModalRef,
    private cryptoService: CryptoService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    this.showMasterPassOnRestart = this.masterPassOnRestart =
      !(await this.keyConnectorService.getUsesKeyConnector());
  }

  toggleVisibility() {
    this.showPin = !this.showPin;
  }

  async submit() {
    if (Utils.isNullOrWhitespace(this.pin)) {
      this.modalRef.close(false);
    }

    const kdf = await this.stateService.getKdfType();
    const kdfConfig = await this.stateService.getKdfConfig();
    const email = await this.stateService.getEmail();
    const pinKey = await this.cryptoService.makePinKey(this.pin, email, kdf, kdfConfig);
    const key = await this.cryptoService.getKey();
    const pinProtectedKey = await this.cryptoService.encrypt(key.key, pinKey);
    if (this.masterPassOnRestart) {
      const encPin = await this.cryptoService.encrypt(this.pin);
      await this.stateService.setProtectedPin(encPin.encryptedString);
      await this.stateService.setDecryptedPinProtected(pinProtectedKey);
    } else {
      await this.stateService.setEncryptedPinProtected(pinProtectedKey.encryptedString);
    }

    this.modalRef.close(true);
  }
}
