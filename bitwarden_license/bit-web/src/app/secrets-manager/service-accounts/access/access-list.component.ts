import { SelectionModel } from "@angular/cdk/collections";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { AccessTokenView } from "../models/view/access-token.view";

@Component({
  selector: "sm-access-list",
  templateUrl: "./access-list.component.html",
})
export class AccessListComponent {
  @Input()
  get tokens(): AccessTokenView[] {
    return this._tokens;
  }
  set tokens(secrets: AccessTokenView[]) {
    this.selection.clear();
    this._tokens = secrets;
  }
  private _tokens: AccessTokenView[];

  @Output() newAccessTokenEvent = new EventEmitter();

  protected selection = new SelectionModel<string>(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tokens.length;
    return numSelected === numRows;
  }

  toggleAll() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...this.tokens.map((s) => s.id));
  }

  protected permission(token: AccessTokenView) {
    return "canRead";
  }
}
