import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";

export interface PasswordColorText {
  color: string;
  text: string;
}

@Component({
  selector: "app-password-strength",
  templateUrl: "password-strength.component.html",
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() showText = false;
  @Input() email: string;
  @Input() name: string;
  @Input() set password(value: string) {
    this.updatePasswordStrength(value);
  }
  @Output() passwordStrengthResult = new EventEmitter<any>();
  @Output() passwordScoreColor = new EventEmitter<PasswordColorText>();

  masterPasswordScore: number;
  scoreWidth = 0;
  color = "bg-danger";
  text: string;

  private masterPasswordStrengthTimeout: any;

  //used by desktop and browser to display strength text color
  get masterPasswordScoreColor() {
    switch (this.masterPasswordScore) {
      case 4:
        return "success";
      case 3:
        return "primary";
      case 2:
        return "warning";
      default:
        return "danger";
    }
  }

  //used by desktop and browser to display strength text
  get masterPasswordScoreText() {
    switch (this.masterPasswordScore) {
      case 4:
        return this.i18nService.t("strong");
      case 3:
        return this.i18nService.t("good");
      case 2:
        return this.i18nService.t("weak");
      default:
        return this.masterPasswordScore != null ? this.i18nService.t("weak") : null;
    }
  }

  constructor(
    private i18nService: I18nService,
    private passwordGenerationService: PasswordGenerationService
  ) {}

  ngOnChanges(): void {
    this.masterPasswordStrengthTimeout = setTimeout(() => {
      this.scoreWidth = this.masterPasswordScore == null ? 0 : (this.masterPasswordScore + 1) * 20;

      switch (this.masterPasswordScore) {
        case 4:
          this.color = "bg-success";
          this.text = this.i18nService.t("strong");
          break;
        case 3:
          this.color = "bg-primary";
          this.text = this.i18nService.t("good");
          break;
        case 2:
          this.color = "bg-warning";
          this.text = this.i18nService.t("weak");
          break;
        default:
          this.color = "bg-danger";
          this.text = this.masterPasswordScore != null ? this.i18nService.t("weak") : null;
          break;
      }

      this.setPasswordScoreText(this.color, this.text);
    }, 300);
  }

  updatePasswordStrength(password: string) {
    const masterPassword = password;

    if (this.masterPasswordStrengthTimeout != null) {
      clearTimeout(this.masterPasswordStrengthTimeout);
    }

    const strengthResult = this.passwordGenerationService.passwordStrength(
      masterPassword,
      this.getPasswordStrengthUserInput()
    );
    this.passwordStrengthResult.emit(strengthResult);
    this.masterPasswordScore = strengthResult == null ? null : strengthResult.score;
  }

  getPasswordStrengthUserInput() {
    let userInput: string[] = [];
    const email = this.email;
    const name = this.name;
    const atPosition = email?.indexOf("@");
    if (atPosition > -1) {
      userInput = userInput.concat(
        email
          .substr(0, atPosition)
          .trim()
          .toLowerCase()
          .split(/[^A-Za-z0-9]/)
      );
    }
    if (name != null && name !== "") {
      userInput = userInput.concat(name.trim().toLowerCase().split(" "));
    }
    return userInput;
  }

  setPasswordScoreText(color: string, text: string) {
    color = color.slice(3);
    this.passwordScoreColor.emit({ color: color, text: text });
  }
}
