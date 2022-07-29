import { SecretVerificationRequest } from "@bitwarden/common/models/request/secretVerificationRequest";

export abstract class AccountApiService {
  abstract deleteAccount(request: SecretVerificationRequest): Promise<void>;
}
