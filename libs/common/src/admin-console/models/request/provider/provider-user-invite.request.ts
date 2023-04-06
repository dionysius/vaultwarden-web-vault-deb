import { ProviderUserType } from "../../../enums";

export class ProviderUserInviteRequest {
  emails: string[] = [];
  type: ProviderUserType;
}
