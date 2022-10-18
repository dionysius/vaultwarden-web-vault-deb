import { Component, OnInit } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UpdateDomainsRequest } from "@bitwarden/common/models/request/update-domains.request";

@Component({
  selector: "app-domain-rules",
  templateUrl: "domain-rules.component.html",
})
export class DomainRulesComponent implements OnInit {
  loading = true;
  custom: string[] = [];
  global: any[] = [];
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    const response = await this.apiService.getSettingsDomains();
    this.loading = false;
    if (response.equivalentDomains != null) {
      this.custom = response.equivalentDomains.map((d) => d.join(", "));
    }
    if (response.globalEquivalentDomains != null) {
      this.global = response.globalEquivalentDomains.map((d) => {
        return {
          domains: d.domains.join(", "),
          excluded: d.excluded,
          key: d.type,
        };
      });
    }
  }

  toggleExcluded(globalDomain: any) {
    globalDomain.excluded = !globalDomain.excluded;
  }

  customize(globalDomain: any) {
    globalDomain.excluded = true;
    this.custom.push(globalDomain.domains);
  }

  remove(index: number) {
    this.custom.splice(index, 1);
  }

  add() {
    this.custom.push("");
  }

  async submit() {
    const request = new UpdateDomainsRequest();
    request.excludedGlobalEquivalentDomains = this.global
      .filter((d) => d.excluded)
      .map((d) => d.key);
    if (request.excludedGlobalEquivalentDomains.length === 0) {
      request.excludedGlobalEquivalentDomains = null;
    }
    request.equivalentDomains = this.custom
      .filter((d) => d != null && d.trim() !== "")
      .map((d) => d.split(",").map((d2) => d2.trim()));
    if (request.equivalentDomains.length === 0) {
      request.equivalentDomains = null;
    }

    try {
      this.formPromise = this.apiService.putSettingsDomains(request);
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("domainsUpdated"));
    } catch (e) {
      this.logService.error(e);
    }
  }

  indexTrackBy(index: number, obj: any): any {
    return index;
  }
}
