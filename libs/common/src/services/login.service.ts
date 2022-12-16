import { LoginService as LoginServiceAbstraction } from "../abstractions/login.service";
import { StateService } from "../abstractions/state.service";

export class LoginService implements LoginServiceAbstraction {
  private _email: string;
  private _rememberEmail: boolean;

  constructor(private stateService: StateService) {}

  getEmail() {
    return this._email;
  }

  getRememberEmail() {
    return this._rememberEmail;
  }

  setEmail(value: string) {
    this._email = value;
  }

  setRememberEmail(value: boolean) {
    this._rememberEmail = value;
  }

  clearValues() {
    this._email = null;
    this._rememberEmail = null;
  }

  async saveEmailSettings() {
    await this.stateService.setRememberedEmail(this._rememberEmail ? this._email : null);
    this.clearValues();
  }
}
