import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { concatMap, Subject, takeUntil } from "rxjs";

import { SelectOptions } from "@bitwarden/angular/interfaces/selectOptions";
import { ControlsOf } from "@bitwarden/angular/types/controls-of";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/abstractions/organization/organization-api.service.abstraction";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import {
  OpenIdConnectRedirectBehavior,
  Saml2BindingType,
  Saml2NameIdFormat,
  Saml2SigningBehavior,
  SsoType,
} from "@bitwarden/common/enums/ssoEnums";
import { Utils } from "@bitwarden/common/misc/utils";
import { SsoConfigApi } from "@bitwarden/common/models/api/sso-config.api";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { OrganizationSsoRequest } from "@bitwarden/common/models/request/organization/organization-sso.request";
import { OrganizationSsoResponse } from "@bitwarden/common/models/response/organization/organization-sso.response";
import { SsoConfigView } from "@bitwarden/common/models/view/sso-config.view";

const defaultSigningAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";

@Component({
  selector: "app-org-manage-sso",
  templateUrl: "sso.component.html",
})
export class SsoComponent implements OnInit, OnDestroy {
  readonly ssoType = SsoType;

  readonly ssoTypeOptions: SelectOptions[] = [
    { name: this.i18nService.t("selectType"), value: SsoType.None, disabled: true },
    { name: "OpenID Connect", value: SsoType.OpenIdConnect },
    { name: "SAML 2.0", value: SsoType.Saml2 },
  ];

  readonly samlSigningAlgorithms = [
    "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha384",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha512",
  ];

  readonly saml2SigningBehaviourOptions: SelectOptions[] = [
    {
      name: "If IdP Wants Authn Requests Signed",
      value: Saml2SigningBehavior.IfIdpWantAuthnRequestsSigned,
    },
    { name: "Always", value: Saml2SigningBehavior.Always },
    { name: "Never", value: Saml2SigningBehavior.Never },
  ];
  readonly saml2BindingTypeOptions: SelectOptions[] = [
    { name: "Redirect", value: Saml2BindingType.HttpRedirect },
    { name: "HTTP POST", value: Saml2BindingType.HttpPost },
  ];
  readonly saml2NameIdFormatOptions: SelectOptions[] = [
    { name: "Not Configured", value: Saml2NameIdFormat.NotConfigured },
    { name: "Unspecified", value: Saml2NameIdFormat.Unspecified },
    { name: "Email Address", value: Saml2NameIdFormat.EmailAddress },
    { name: "X.509 Subject Name", value: Saml2NameIdFormat.X509SubjectName },
    { name: "Windows Domain Qualified Name", value: Saml2NameIdFormat.WindowsDomainQualifiedName },
    { name: "Kerberos Principal Name", value: Saml2NameIdFormat.KerberosPrincipalName },
    { name: "Entity Identifier", value: Saml2NameIdFormat.EntityIdentifier },
    { name: "Persistent", value: Saml2NameIdFormat.Persistent },
    { name: "Transient", value: Saml2NameIdFormat.Transient },
  ];

  readonly connectRedirectOptions: SelectOptions[] = [
    { name: "Redirect GET", value: OpenIdConnectRedirectBehavior.RedirectGet },
    { name: "Form POST", value: OpenIdConnectRedirectBehavior.FormPost },
  ];

  private destory$ = new Subject<void>();

  showOpenIdCustomizations = false;

  loading = true;
  haveTestedKeyConnector = false;
  organizationId: string;
  organization: Organization;
  formPromise: Promise<OrganizationSsoResponse>;

  callbackPath: string;
  signedOutCallbackPath: string;
  spEntityId: string;
  spMetadataUrl: string;
  spAcsUrl: string;

  protected enabled = this.formBuilder.control(false);

  protected ssoIdentifier = this.formBuilder.control("", {
    validators: [Validators.maxLength(50), Validators.required],
  });

  protected openIdForm = this.formBuilder.group<ControlsOf<SsoConfigView["openId"]>>(
    {
      authority: new FormControl("", Validators.required),
      clientId: new FormControl("", Validators.required),
      clientSecret: new FormControl("", Validators.required),
      metadataAddress: new FormControl(),
      redirectBehavior: new FormControl(
        OpenIdConnectRedirectBehavior.RedirectGet,
        Validators.required
      ),
      getClaimsFromUserInfoEndpoint: new FormControl(),
      additionalScopes: new FormControl(),
      additionalUserIdClaimTypes: new FormControl(),
      additionalEmailClaimTypes: new FormControl(),
      additionalNameClaimTypes: new FormControl(),
      acrValues: new FormControl(),
      expectedReturnAcrValue: new FormControl(),
    },
    {
      updateOn: "blur",
    }
  );

  protected samlForm = this.formBuilder.group<ControlsOf<SsoConfigView["saml"]>>(
    {
      spNameIdFormat: new FormControl(Saml2NameIdFormat.NotConfigured),
      spOutboundSigningAlgorithm: new FormControl(defaultSigningAlgorithm),
      spSigningBehavior: new FormControl(Saml2SigningBehavior.IfIdpWantAuthnRequestsSigned),
      spMinIncomingSigningAlgorithm: new FormControl(defaultSigningAlgorithm),
      spWantAssertionsSigned: new FormControl(),
      spValidateCertificates: new FormControl(),

      idpEntityId: new FormControl("", Validators.required),
      idpBindingType: new FormControl(Saml2BindingType.HttpRedirect),
      idpSingleSignOnServiceUrl: new FormControl(),
      idpSingleLogoutServiceUrl: new FormControl(),
      idpX509PublicCert: new FormControl("", Validators.required),
      idpOutboundSigningAlgorithm: new FormControl(defaultSigningAlgorithm),
      idpAllowUnsolicitedAuthnResponse: new FormControl(),
      idpAllowOutboundLogoutRequests: new FormControl(true),
      idpWantAuthnRequestsSigned: new FormControl(),
    },
    {
      updateOn: "blur",
    }
  );

  protected ssoConfigForm = this.formBuilder.group<ControlsOf<SsoConfigView>>({
    configType: new FormControl(SsoType.None),
    keyConnectorEnabled: new FormControl(false),
    keyConnectorUrl: new FormControl(""),
    openId: this.openIdForm,
    saml: this.samlForm,
  });

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private organizationApiService: OrganizationApiServiceAbstraction
  ) {}

  async ngOnInit() {
    this.ssoConfigForm
      .get("configType")
      .valueChanges.pipe(takeUntil(this.destory$))
      .subscribe((newType: SsoType) => {
        if (newType === SsoType.OpenIdConnect) {
          this.openIdForm.enable();
          this.samlForm.disable();
        } else if (newType === SsoType.Saml2) {
          this.openIdForm.disable();
          this.samlForm.enable();
        } else {
          this.openIdForm.disable();
          this.samlForm.disable();
        }
      });

    this.samlForm
      .get("spSigningBehavior")
      .valueChanges.pipe(takeUntil(this.destory$))
      .subscribe(() => this.samlForm.get("idpX509PublicCert").updateValueAndValidity());

    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.organizationId = params.organizationId;
          await this.load();
        }),
        takeUntil(this.destory$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }

  async load() {
    this.organization = await this.organizationService.get(this.organizationId);
    const ssoSettings = await this.organizationApiService.getSso(this.organizationId);
    this.populateForm(ssoSettings);

    this.callbackPath = ssoSettings.urls.callbackPath;
    this.signedOutCallbackPath = ssoSettings.urls.signedOutCallbackPath;
    this.spEntityId = ssoSettings.urls.spEntityId;
    this.spMetadataUrl = ssoSettings.urls.spMetadataUrl;
    this.spAcsUrl = ssoSettings.urls.spAcsUrl;

    this.loading = false;
  }

  async submit() {
    this.validateForm(this.ssoConfigForm);

    if (this.ssoConfigForm.value.keyConnectorEnabled) {
      this.haveTestedKeyConnector = false;
      await this.validateKeyConnectorUrl();
    }

    if (!this.ssoConfigForm.valid) {
      this.readOutErrors();
      return;
    }

    const request = new OrganizationSsoRequest();
    request.enabled = this.enabled.value;
    request.identifier = this.ssoIdentifier.value;
    request.data = SsoConfigApi.fromView(this.ssoConfigForm.getRawValue());

    this.formPromise = this.organizationApiService.updateSso(this.organizationId, request);

    try {
      const response = await this.formPromise;
      this.populateForm(response);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("ssoSettingsSaved"));
    } catch {
      // Logged by appApiAction, do nothing
    }

    this.formPromise = null;
  }

  async validateKeyConnectorUrl() {
    if (this.haveTestedKeyConnector) {
      return;
    }

    this.keyConnectorUrl.markAsPending();

    try {
      await this.apiService.getKeyConnectorAlive(this.keyConnectorUrl.value);
      this.keyConnectorUrl.updateValueAndValidity();
    } catch {
      this.keyConnectorUrl.setErrors({
        invalidUrl: { message: this.i18nService.t("keyConnectorTestFail") },
      });
    }

    this.haveTestedKeyConnector = true;
  }

  toggleOpenIdCustomizations() {
    this.showOpenIdCustomizations = !this.showOpenIdCustomizations;
  }

  getErrorCount(form: UntypedFormGroup): number {
    return Object.values(form.controls).reduce((acc: number, control: AbstractControl) => {
      if (control instanceof UntypedFormGroup) {
        return acc + this.getErrorCount(control);
      }

      if (control.errors == null) {
        return acc;
      }
      return acc + Object.keys(control.errors).length;
    }, 0);
  }

  get enableTestKeyConnector() {
    return (
      this.ssoConfigForm.get("keyConnectorEnabled").value &&
      !Utils.isNullOrWhitespace(this.keyConnectorUrl?.value)
    );
  }

  get keyConnectorUrl() {
    return this.ssoConfigForm.get("keyConnectorUrl");
  }

  get samlSigningAlgorithmOptions(): SelectOptions[] {
    return this.samlSigningAlgorithms.map((algorithm) => ({ name: algorithm, value: algorithm }));
  }

  private validateForm(form: UntypedFormGroup) {
    Object.values(form.controls).forEach((control: AbstractControl) => {
      if (control.disabled) {
        return;
      }

      if (control instanceof UntypedFormGroup) {
        this.validateForm(control);
      } else {
        control.markAsDirty();
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  private populateForm(ssoSettings: OrganizationSsoResponse) {
    this.enabled.setValue(ssoSettings.enabled);
    this.ssoIdentifier.setValue(ssoSettings.identifier);
    if (ssoSettings.data != null) {
      const ssoConfigView = new SsoConfigView(ssoSettings.data);
      this.ssoConfigForm.patchValue(ssoConfigView);
    }
  }

  private readOutErrors() {
    const errorText = this.i18nService.t("error");
    const errorCount = this.getErrorCount(this.ssoConfigForm);
    const errorCountText = this.i18nService.t(
      errorCount === 1 ? "formErrorSummarySingle" : "formErrorSummaryPlural",
      errorCount.toString()
    );

    const div = document.createElement("div");
    div.className = "sr-only";
    div.id = "srErrorCount";
    div.setAttribute("aria-live", "polite");
    div.innerText = errorText + ": " + errorCountText;

    const existing = document.getElementById("srErrorCount");
    if (existing != null) {
      existing.remove();
    }

    document.body.append(div);
  }
}
