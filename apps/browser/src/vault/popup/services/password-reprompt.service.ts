import { Injectable } from "@angular/core";

import { PasswordRepromptService as BasePasswordRepromptService } from "@bitwarden/angular/vault/services/password-reprompt.service";

import { PasswordRepromptComponent } from "../components/password-reprompt.component";

@Injectable()
export class PasswordRepromptService extends BasePasswordRepromptService {
  component = PasswordRepromptComponent;
}
