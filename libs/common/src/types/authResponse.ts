import { VerificationType } from "../enums/verificationType";

import { TwoFactorResponse } from "./twoFactorResponse";

export type AuthResponseBase = {
  secret: string;
  verificationType: VerificationType;
};

export type AuthResponse<T extends TwoFactorResponse> = AuthResponseBase & {
  response: T;
};
