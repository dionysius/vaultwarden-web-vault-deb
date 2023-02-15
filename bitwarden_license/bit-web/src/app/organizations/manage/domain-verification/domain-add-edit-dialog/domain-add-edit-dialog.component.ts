import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrgDomainApiServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain-api.service.abstraction";
import { OrgDomainServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain.service.abstraction";
import { OrganizationDomainResponse } from "@bitwarden/common/abstractions/organization-domain/responses/organization-domain.response";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { HttpStatusCode } from "@bitwarden/common/enums/http-status-code.enum";
import { Utils } from "@bitwarden/common/misc/utils";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { OrganizationDomainRequest } from "@bitwarden/common/services/organization-domain/requests/organization-domain.request";

import { domainNameValidator } from "./validators/domain-name.validator";
import { uniqueInArrayValidator } from "./validators/unique-in-array.validator";
export interface DomainAddEditDialogData {
  organizationId: string;
  orgDomain: OrganizationDomainResponse;
  existingDomainNames: Array<string>;
}

@Component({
  selector: "app-domain-add-edit-dialog",
  templateUrl: "domain-add-edit-dialog.component.html",
})
export class DomainAddEditDialogComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject();

  domainForm: FormGroup = this.formBuilder.group({
    domainName: [
      "",
      [
        Validators.required,
        domainNameValidator(this.i18nService.t("invalidDomainNameMessage")),
        uniqueInArrayValidator(
          this.data.existingDomainNames,
          this.i18nService.t("duplicateDomainError")
        ),
      ],
    ],
    txt: [{ value: null, disabled: true }],
  });

  get domainNameCtrl(): FormControl {
    return this.domainForm.controls.domainName as FormControl;
  }
  get txtCtrl(): FormControl {
    return this.domainForm.controls.txt as FormControl;
  }

  rejectedDomainNameValidator: ValidatorFn = null;

  rejectedDomainNames: Array<string> = [];

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: DomainAddEditDialogData,
    private formBuilder: FormBuilder,
    private cryptoFunctionService: CryptoFunctionServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private orgDomainApiService: OrgDomainApiServiceAbstraction,
    private orgDomainService: OrgDomainServiceAbstraction,
    private validationService: ValidationService
  ) {}

  //#region Angular Method Implementations

  async ngOnInit(): Promise<void> {
    // If we have data.orgDomain, then editing, otherwise creating new domain
    await this.populateForm();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  //#endregion

  //#region Form methods

  async populateForm(): Promise<void> {
    if (this.data.orgDomain) {
      // Edit
      this.domainForm.patchValue(this.data.orgDomain);
      this.domainForm.disable();
    } else {
      // Add

      // Figuring out the proper length of our DNS TXT Record value was fun.
      // DNS-Based Service Discovery RFC: https://www.ietf.org/rfc/rfc6763.txt; see section 6.1
      // Google uses 43 chars for their TXT record value: https://support.google.com/a/answer/2716802
      // So, chose a magic # of 33 bytes to achieve at least that once converted to base 64 (47 char length).
      const generatedTxt = `bw=${Utils.fromBufferToB64(
        await this.cryptoFunctionService.randomBytes(33)
      )}`;
      this.txtCtrl.setValue(generatedTxt);
    }

    this.setupFormListeners();
  }

  setupFormListeners(): void {
    // <bit-form-field> suppresses touched state on change for reactive form controls
    // Manually set touched to show validation errors as the user stypes
    this.domainForm.valueChanges.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.domainForm.markAllAsTouched();
    });
  }

  copyDnsTxt(): void {
    this.orgDomainService.copyDnsTxt(this.txtCtrl.value);
  }

  //#endregion

  //#region Async Form Actions
  saveDomain = async (): Promise<void> => {
    if (this.domainForm.invalid) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("domainFormInvalid"));
      return;
    }

    this.domainNameCtrl.disable();

    const request: OrganizationDomainRequest = new OrganizationDomainRequest(
      this.txtCtrl.value,
      this.domainNameCtrl.value
    );

    try {
      this.data.orgDomain = await this.orgDomainApiService.post(this.data.organizationId, request);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("domainSaved"));
      await this.verifyDomain();
    } catch (e) {
      this.handleDomainSaveError(e);
    }
  };

  private handleDomainSaveError(e: any): void {
    if (e instanceof ErrorResponse) {
      const errorResponse: ErrorResponse = e as ErrorResponse;
      switch (errorResponse.statusCode) {
        case HttpStatusCode.Conflict:
          if (errorResponse.message.includes("The domain is not available to be claimed")) {
            // If user has attempted to claim a different rejected domain first:
            if (this.rejectedDomainNameValidator) {
              // Remove the validator:
              this.domainNameCtrl.removeValidators(this.rejectedDomainNameValidator);
              this.domainNameCtrl.updateValueAndValidity();
            }

            // Update rejected domain names and add new unique in validator
            // which will prevent future known bad domain name submissions.
            this.rejectedDomainNames.push(this.domainNameCtrl.value);

            this.rejectedDomainNameValidator = uniqueInArrayValidator(
              this.rejectedDomainNames,
              this.i18nService.t("domainNotAvailable", this.domainNameCtrl.value)
            );

            this.domainNameCtrl.addValidators(this.rejectedDomainNameValidator);
            this.domainNameCtrl.updateValueAndValidity();

            // Give them another chance to enter a new domain name:
            this.domainForm.enable();
          } else {
            this.validationService.showError(errorResponse);
          }

          break;

        default:
          this.validationService.showError(errorResponse);
          break;
      }
    } else {
      this.validationService.showError(e);
    }
  }

  verifyDomain = async (): Promise<void> => {
    if (this.domainForm.invalid) {
      // Note: shouldn't be possible, but going to leave this to be safe.
      this.platformUtilsService.showToast("error", null, this.i18nService.t("domainFormInvalid"));
      return;
    }

    try {
      this.data.orgDomain = await this.orgDomainApiService.verify(
        this.data.organizationId,
        this.data.orgDomain.id
      );

      if (this.data.orgDomain.verifiedDate) {
        this.platformUtilsService.showToast("success", null, this.i18nService.t("domainVerified"));
        this.dialogRef.close();
      } else {
        this.domainNameCtrl.setErrors({
          errorPassthrough: {
            message: this.i18nService.t("domainNotVerified", this.domainNameCtrl.value),
          },
        });
        // For the case where user opens dialog and reverifies when domain name formControl disabled.
        // The input directive only shows error if touched, so must manually mark as touched.
        this.domainNameCtrl.markAsTouched();
        // Update this item so the last checked date gets updated.
        await this.updateOrgDomain();
      }
    } catch (e) {
      this.handleVerifyDomainError(e, this.domainNameCtrl.value);
      // Update this item so the last checked date gets updated.
      await this.updateOrgDomain();
    }
  };

  private handleVerifyDomainError(e: any, domainName: string): void {
    if (e instanceof ErrorResponse) {
      const errorResponse: ErrorResponse = e as ErrorResponse;
      switch (errorResponse.statusCode) {
        case HttpStatusCode.Conflict:
          if (errorResponse.message.includes("The domain is not available to be claimed")) {
            this.domainNameCtrl.setErrors({
              errorPassthrough: {
                message: this.i18nService.t("domainNotAvailable", domainName),
              },
            });
          }
          break;

        default:
          this.validationService.showError(errorResponse);
          break;
      }
    }
  }

  private async updateOrgDomain() {
    // Update this item so the last checked date gets updated.
    await this.orgDomainApiService.getByOrgIdAndOrgDomainId(
      this.data.organizationId,
      this.data.orgDomain.id
    );
  }

  deleteDomain = async (): Promise<void> => {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("removeDomainWarning"),
      this.i18nService.t("removeDomain"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return;
    }

    await this.orgDomainApiService.delete(this.data.organizationId, this.data.orgDomain.id);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("domainRemoved"));

    this.dialogRef.close();
  };

  //#endregion
}
