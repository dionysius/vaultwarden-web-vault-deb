import { Verification } from "../../types/verification";

export abstract class AccountApiService {
  abstract deleteAccount(verification: Verification): Promise<void>;
}
