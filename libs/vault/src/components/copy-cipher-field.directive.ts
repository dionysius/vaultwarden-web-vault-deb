import { Directive, HostBinding, HostListener, Input, OnChanges } from "@angular/core";

import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CopyAction, CopyCipherFieldService } from "@bitwarden/vault";

/**
 * Directive to copy a specific field from a cipher on click. Uses the `CopyCipherFieldService` to
 * handle the copying of the field and any necessary password re-prompting or totp generation.
 *
 * Automatically disables the host element if the field to copy is not available or null.
 *
 * @example
 * ```html
 * <button appCopyField="username" [cipher]="cipher">Copy Username</button>
 * ```
 */
@Directive({
  standalone: true,
  selector: "[appCopyField]",
})
export class CopyCipherFieldDirective implements OnChanges {
  @Input({
    alias: "appCopyField",
    required: true,
  })
  action: Exclude<CopyAction, "hiddenField">;

  @Input({ required: true }) cipher: CipherView;

  constructor(private copyCipherFieldService: CopyCipherFieldService) {}

  @HostBinding("attr.disabled")
  protected disabled: boolean | null = null;

  @HostListener("click")
  async copy() {
    const value = this.getValueToCopy();
    await this.copyCipherFieldService.copy(value, this.action, this.cipher);
  }

  async ngOnChanges() {
    await this.updateDisabledState();
  }

  private async updateDisabledState() {
    this.disabled =
      !this.cipher ||
      !this.getValueToCopy() ||
      (this.action === "totp" && !(await this.copyCipherFieldService.totpAllowed(this.cipher)))
        ? true
        : null;
  }

  private getValueToCopy() {
    switch (this.action) {
      case "username":
        return this.cipher.login?.username || this.cipher.identity?.username;
      case "password":
        return this.cipher.login?.password;
      case "totp":
        return this.cipher.login?.totp;
      case "cardNumber":
        return this.cipher.card?.number;
      case "securityCode":
        return this.cipher.card?.code;
      case "email":
        return this.cipher.identity?.email;
      case "phone":
        return this.cipher.identity?.phone;
      case "address":
        return this.cipher.identity?.fullAddressForCopy;
      case "secureNote":
        return this.cipher.notes;
      default:
        return null;
    }
  }
}
