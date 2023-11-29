import { AuthRequestType } from "../../enums/auth-request-type";

export class CreateAuthRequest {
  constructor(
    readonly email: string,
    readonly deviceIdentifier: string,
    readonly publicKey: string,
    readonly type: AuthRequestType,
    readonly accessCode: string,
  ) {}
}
