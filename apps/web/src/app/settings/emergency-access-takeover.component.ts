import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { takeUntil } from "rxjs";

import { ChangePasswordComponent } from "@bitwarden/angular/components/change-password.component";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { KdfType } from "@bitwarden/common/enums/kdfType";
import { PolicyData } from "@bitwarden/common/models/data/policy.data";
import { KdfConfig } from "@bitwarden/common/models/domain/kdf-config";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetric-crypto-key";
import { EmergencyAccessPasswordRequest } from "@bitwarden/common/models/request/emergency-access-password.request";
import { PolicyResponse } from "@bitwarden/common/models/response/policy.response";

@Component({
  selector: "emergency-access-takeover",
  templateUrl: "emergency-access-takeover.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class EmergencyAccessTakeoverComponent
  extends ChangePasswordComponent
  implements OnInit, OnDestroy
{
  @Output() onDone = new EventEmitter();
  @Input() emergencyAccessId: string;
  @Input() name: string;
  @Input() email: string;
  @Input() kdf: KdfType;
  @Input() kdfIterations: number;

  formPromise: Promise<any>;

  constructor(
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    stateService: StateService,
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    private apiService: ApiService,
    private logService: LogService
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      stateService
    );
  }

  async ngOnInit() {
    const response = await this.apiService.getEmergencyGrantorPolicies(this.emergencyAccessId);
    if (response.data != null && response.data.length > 0) {
      const policies = response.data.map(
        (policyResponse: PolicyResponse) => new Policy(new PolicyData(policyResponse))
      );

      this.policyService
        .masterPasswordPolicyOptions$(policies)
        .pipe(takeUntil(this.destroy$))
        .subscribe((enforcedPolicyOptions) => (this.enforcedPolicyOptions = enforcedPolicyOptions));
    }
  }

  // eslint-disable-next-line rxjs-angular/prefer-takeuntil
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  async submit() {
    if (!(await this.strongPassword())) {
      return;
    }

    const takeoverResponse = await this.apiService.postEmergencyAccessTakeover(
      this.emergencyAccessId
    );

    const oldKeyBuffer = await this.cryptoService.rsaDecrypt(takeoverResponse.keyEncrypted);
    const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer);

    if (oldEncKey == null) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("unexpectedError")
      );
      return;
    }

    const key = await this.cryptoService.makeKey(
      this.masterPassword,
      this.email,
      takeoverResponse.kdf,
      new KdfConfig(
        takeoverResponse.kdfIterations,
        takeoverResponse.kdfMemory,
        takeoverResponse.kdfParallelism
      )
    );
    const masterPasswordHash = await this.cryptoService.hashPassword(this.masterPassword, key);

    const encKey = await this.cryptoService.remakeEncKey(key, oldEncKey);

    const request = new EmergencyAccessPasswordRequest();
    request.newMasterPasswordHash = masterPasswordHash;
    request.key = encKey[1].encryptedString;

    this.apiService.postEmergencyAccessPassword(this.emergencyAccessId, request);

    try {
      this.onDone.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
