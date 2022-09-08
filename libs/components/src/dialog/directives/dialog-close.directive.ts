import { DialogRef } from "@angular/cdk/dialog";
import { Directive, HostListener, Input, Optional } from "@angular/core";

@Directive({
  selector: "[bitDialogClose]",
})
export class DialogCloseDirective {
  @Input("bit-dialog-close") dialogResult: any;

  constructor(@Optional() public dialogRef: DialogRef<any>) {}

  @HostListener("click") close(): void {
    this.dialogRef.close(this.dialogResult);
  }
}
