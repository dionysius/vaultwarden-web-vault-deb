import { DialogRef } from "@angular/cdk/dialog";
import { Directive, Input, Optional } from "@angular/core";

@Directive({
  selector: "[bitDialogClose]",
  host: {
    "(click)": "close()",
  },
})
export class DialogCloseDirective {
  @Input("bit-dialog-close") dialogResult: any;

  constructor(@Optional() public dialogRef: DialogRef<any>) {}

  close() {
    this.dialogRef.close(this.dialogResult);
  }
}
