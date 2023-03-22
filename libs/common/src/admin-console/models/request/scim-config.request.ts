import { ScimProviderType } from "../../enums/scim-provider-type";

export class ScimConfigRequest {
  constructor(private enabled: boolean, private scimProvider: ScimProviderType = null) {}
}
