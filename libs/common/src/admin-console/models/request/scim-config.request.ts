import { ScimProviderType } from "../../enums";

export class ScimConfigRequest {
  constructor(
    private enabled: boolean,
    private scimProvider: ScimProviderType = null,
  ) {}
}
