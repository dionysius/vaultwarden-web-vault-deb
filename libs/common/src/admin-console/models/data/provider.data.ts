import { ProviderUserStatusType } from "../../enums/provider-user-status-type";
import { ProviderUserType } from "../../enums/provider-user-type";
import { ProfileProviderResponse } from "../response/profile-provider.response";

export class ProviderData {
  id: string;
  name: string;
  status: ProviderUserStatusType;
  type: ProviderUserType;
  enabled: boolean;
  userId: string;
  useEvents: boolean;

  constructor(response: ProfileProviderResponse) {
    this.id = response.id;
    this.name = response.name;
    this.status = response.status;
    this.type = response.type;
    this.enabled = response.enabled;
    this.userId = response.userId;
    this.useEvents = response.useEvents;
  }
}
