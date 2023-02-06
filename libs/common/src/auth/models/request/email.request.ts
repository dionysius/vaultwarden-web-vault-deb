import { EmailTokenRequest } from "./email-token.request";

export class EmailRequest extends EmailTokenRequest {
  newMasterPasswordHash: string;
  token: string;
  key: string;
}
