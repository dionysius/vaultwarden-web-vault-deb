import { Verification } from "../../types/verification";

export abstract class AccountService {
  abstract delete(verification: Verification): Promise<any>;
}
