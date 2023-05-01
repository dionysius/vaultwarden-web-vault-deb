import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { TableDataSource } from "@bitwarden/components";
import { ImportResult } from "@bitwarden/importer";

export interface ResultList {
  icon: string;
  type: string;
  count: number;
}

@Component({
  templateUrl: "./import-success-dialog.component.html",
})
export class ImportSuccessDialogComponent implements OnInit {
  protected dataSource = new TableDataSource<ResultList>();

  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: ImportResult) {}

  ngOnInit(): void {
    if (this.data != null) {
      this.dataSource.data = this.buildResultList();
    }
  }

  private buildResultList(): ResultList[] {
    let logins = 0;
    let cards = 0;
    let identities = 0;
    let secureNotes = 0;
    this.data.ciphers.map((c) => {
      switch (c.type) {
        case CipherType.Login:
          logins++;
          break;
        case CipherType.Card:
          cards++;
          break;
        case CipherType.SecureNote:
          secureNotes++;
          break;
        case CipherType.Identity:
          identities++;
          break;
        default:
          break;
      }
    });

    const list: ResultList[] = [];
    if (logins > 0) {
      list.push({ icon: "globe", type: "typeLogin", count: logins });
    }
    if (cards > 0) {
      list.push({ icon: "credit-card", type: "typeCard", count: cards });
    }
    if (identities > 0) {
      list.push({ icon: "id-card", type: "typeIdentity", count: identities });
    }
    if (secureNotes > 0) {
      list.push({ icon: "sticky-note", type: "typeSecureNote", count: secureNotes });
    }
    if (this.data.folders.length > 0) {
      list.push({ icon: "folder", type: "folders", count: this.data.folders.length });
    }
    if (this.data.collections.length > 0) {
      list.push({
        icon: "collection",
        type: "collections",
        count: this.data.collections.length,
      });
    }
    return list;
  }
}
