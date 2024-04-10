import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";

@Injectable({ providedIn: "root" })
export class UnassignedItemsBannerApiService {
  constructor(private apiService: ApiService) {}

  async getShowUnassignedCiphersBanner(): Promise<boolean> {
    const r = await this.apiService.send(
      "GET",
      "/ciphers/has-unassigned-ciphers",
      null,
      true,
      true,
    );
    return r;
  }
}
