import { SsoConfigApi } from "../../api/sso-config.api";

export class OrganizationSsoRequest {
  enabled = false;
  identifier: string;
  data: SsoConfigApi;
}
