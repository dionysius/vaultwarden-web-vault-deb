import { AccountStatusResponse } from "./accountStatusResponse";
import { CannotDecryptErrorResponse } from "./cannotDecryptErrorResponse";
import { CipherResponse } from "./cipherResponse";
import { FailureStatusResponse } from "./failureStatusResponse";
import { GenerateResponse } from "./generateResponse";
import { SuccessStatusResponse } from "./successStatusResponse";
import { UserStatusErrorResponse } from "./userStatusErrorResponse";

export type EncyptedMessageResponse =
  | AccountStatusResponse[]
  | CannotDecryptErrorResponse
  | CipherResponse[]
  | FailureStatusResponse
  | GenerateResponse
  | SuccessStatusResponse
  | UserStatusErrorResponse;
