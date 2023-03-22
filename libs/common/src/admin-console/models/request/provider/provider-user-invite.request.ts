import { ProviderUserType } from "../../../enums/provider-user-type";

export class ProviderUserInviteRequest {
  emails: string[] = [];
  type: ProviderUserType;
}
