import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, firstValueFrom, Observable, share, Subject, switchMap, tap } from "rxjs";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import { BaseAccessPolicyView } from "../../models/view/access-policy.view";

import { AccessPolicyService } from "./access-policy.service";

export type AccessSelectorRowView = {
  type: "user" | "group" | "serviceAccount";
  name: string;
  granteeId: string;
  accessPolicyId: string;
  read: boolean;
  write: boolean;
  icon: string;
  static?: boolean;
};

@Component({
  selector: "sm-access-selector",
  templateUrl: "./access-selector.component.html",
})
export class AccessSelectorComponent implements OnInit {
  static readonly userIcon = "bwi-user";
  static readonly groupIcon = "bwi-family";
  static readonly serviceAccountIcon = "bwi-wrench";

  @Output() onCreateAccessPolicies = new EventEmitter<SelectItemView[]>();

  @Input() label: string;
  @Input() hint: string;
  @Input() columnTitle: string;
  @Input() emptyMessage: string;
  @Input() granteeType: "people" | "serviceAccounts";

  protected rows$ = new Subject<AccessSelectorRowView[]>();
  @Input() private set rows(value: AccessSelectorRowView[]) {
    this.rows$.next(value);
  }

  private maxLength = 15;
  protected formGroup = new FormGroup({
    multiSelect: new FormControl([], [Validators.required, Validators.maxLength(this.maxLength)]),
  });
  protected loading = true;

  protected selectItems$: Observable<SelectItemView[]> = combineLatest([
    this.rows$,
    this.route.params,
  ]).pipe(
    switchMap(([rows, params]) =>
      this.getPotentialGrantees(params.organizationId).then((grantees) =>
        grantees
          .filter((g) => !rows.some((row) => row.granteeId === g.id))
          .map((granteeView) => {
            let icon: string;
            let listName = granteeView.name;
            let labelName = granteeView.name;
            if (granteeView.type === "user") {
              icon = AccessSelectorComponent.userIcon;
              if (Utils.isNullOrWhitespace(granteeView.name)) {
                listName = granteeView.email;
                labelName = granteeView.email;
              } else {
                listName = `${granteeView.name} (${granteeView.email})`;
              }
            } else if (granteeView.type === "group") {
              icon = AccessSelectorComponent.groupIcon;
            } else if (granteeView.type === "serviceAccount") {
              icon = AccessSelectorComponent.serviceAccountIcon;
            }
            return {
              icon: icon,
              id: granteeView.id,
              labelName: labelName,
              listName: listName,
            };
          })
      )
    ),
    tap(() => {
      this.loading = false;
      this.formGroup.reset();
      this.formGroup.enable();
    }),
    share()
  );

  constructor(
    private accessPolicyService: AccessPolicyService,
    private validationService: ValidationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formGroup.disable();
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    this.formGroup.disable();
    this.loading = true;

    this.onCreateAccessPolicies.emit(this.formGroup.value.multiSelect);

    return firstValueFrom(this.selectItems$);
  };

  async update(target: any, accessPolicyId: string): Promise<void> {
    try {
      const accessPolicyView = new BaseAccessPolicyView();
      accessPolicyView.id = accessPolicyId;
      if (target.value === "canRead") {
        accessPolicyView.read = true;
        accessPolicyView.write = false;
      } else if (target.value === "canWrite") {
        accessPolicyView.read = false;
        accessPolicyView.write = true;
      } else if (target.value === "canReadWrite") {
        accessPolicyView.read = true;
        accessPolicyView.write = true;
      }

      await this.accessPolicyService.updateAccessPolicy(accessPolicyView);
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  delete = (accessPolicyId: string) => async () => {
    this.loading = true;
    this.formGroup.disable();
    await this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
    return firstValueFrom(this.selectItems$);
  };

  private getPotentialGrantees(organizationId: string) {
    return this.granteeType === "people"
      ? this.accessPolicyService.getPeoplePotentialGrantees(organizationId)
      : this.accessPolicyService.getServiceAccountsPotentialGrantees(organizationId);
  }

  static getAccessItemType(item: SelectItemView) {
    switch (item.icon) {
      case AccessSelectorComponent.userIcon:
        return "user";
      case AccessSelectorComponent.groupIcon:
        return "group";
      case AccessSelectorComponent.serviceAccountIcon:
        return "serviceAccount";
    }
  }
}
