export abstract class AccountService {}

export abstract class InternalAccountService extends AccountService {
  abstract delete(): void;
}
