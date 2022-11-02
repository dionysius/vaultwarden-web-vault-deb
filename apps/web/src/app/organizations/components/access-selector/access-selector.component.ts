import { Component, forwardRef, Input, OnDestroy, OnInit } from "@angular/core";
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

import { FormSelectionList } from "@bitwarden/angular/utils/form-selection-list";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { SelectItemView } from "@bitwarden/components/src/multi-select/models/select-item-view";

import {
  AccessItemType,
  AccessItemValue,
  AccessItemView,
  CollectionPermission,
} from "./access-selector.models";

export enum PermissionMode {
  /**
   * No permission controls or column present. No permission values are emitted.
   */
  Hidden = "hidden",

  /**
   * No permission controls. Column rendered an if available on an item. No permission values are emitted
   */
  Readonly = "readonly",

  /**
   * Permission Controls and column present. Permission values are emitted.
   */
  Edit = "edit",
}

@Component({
  selector: "bit-access-selector",
  templateUrl: "access-selector.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccessSelectorComponent),
      multi: true,
    },
  ],
})
export class AccessSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private notifyOnChange: (v: unknown) => void;
  private notifyOnTouch: () => void;
  private pauseChangeNotification: boolean;

  /**
   * The internal selection list that tracks the value of this form control / component.
   * It's responsible for keeping items sorted and synced with the rendered form controls
   * @protected
   */
  protected selectionList = new FormSelectionList<AccessItemView, AccessItemValue>((item) => {
    const permissionControl = this.formBuilder.control(this.initialPermission);

    const fg = this.formBuilder.group({
      id: item.id,
      type: item.type,
      permission: permissionControl,
    });

    // Disable entire row form group if readonly
    if (item.readonly) {
      fg.disable();
    }

    // Disable permission control if accessAllItems is enabled
    if (item.accessAllItems || this.permissionMode != PermissionMode.Edit) {
      permissionControl.disable();
    }

    return fg;
  }, this._itemComparator.bind(this));

  /**
   * Internal form group for this component.
   * @protected
   */
  protected formGroup = this.formBuilder.group({
    items: this.selectionList.formArray,
  });

  protected itemType = AccessItemType;
  protected permissionList = [
    { perm: CollectionPermission.View, labelId: "canView" },
    { perm: CollectionPermission.ViewExceptPass, labelId: "canViewExceptPass" },
    { perm: CollectionPermission.Edit, labelId: "canEdit" },
    { perm: CollectionPermission.EditExceptPass, labelId: "canEditExceptPass" },
  ];
  protected initialPermission = CollectionPermission.View;

  disabled: boolean;

  /**
   * List of all selectable items that. Sorted internally.
   */
  @Input()
  get items(): AccessItemView[] {
    return this.selectionList.allItems;
  }

  set items(val: AccessItemView[]) {
    const selected = (this.selectionList.formArray.getRawValue() ?? []).concat(
      val.filter((m) => m.readonly)
    );
    this.selectionList.populateItems(
      val.map((m) => {
        m.icon = m.icon ?? this.itemIcon(m); // Ensure an icon is set
        return m;
      }),
      selected
    );
  }

  /**
   * Permission mode that controls if the permission form controls and column should be present.
   */
  @Input()
  get permissionMode(): PermissionMode {
    return this._permissionMode;
  }

  set permissionMode(value: PermissionMode) {
    this._permissionMode = value;
    // Toggle any internal permission controls
    for (const control of this.selectionList.formArray.controls) {
      if (value == PermissionMode.Edit) {
        control.get("permission").enable();
      } else {
        control.get("permission").disable();
      }
    }
  }
  private _permissionMode: PermissionMode = PermissionMode.Hidden;

  /**
   * Column header for the selected items table
   */
  @Input() columnHeader: string;

  /**
   * Label used for the ng selector
   */
  @Input() selectorLabelText: string;

  /**
   * Helper text displayed under the ng selector
   */
  @Input() selectorHelpText: string;

  /**
   * Text that is shown in the table when no items are selected
   */
  @Input() emptySelectionText: string;

  /**
   * Flag for if the member roles column should be present
   */
  @Input() showMemberRoles: boolean;

  /**
   * Flag for if the group column should be present
   */
  @Input() showGroupColumn: boolean;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly i18nService: I18nService
  ) {}

  /** Required for NG_VALUE_ACCESSOR */
  registerOnChange(fn: any): void {
    this.notifyOnChange = fn;
  }

  /** Required for NG_VALUE_ACCESSOR */
  registerOnTouched(fn: any): void {
    this.notifyOnTouch = fn;
  }

  /** Required for NG_VALUE_ACCESSOR */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    // Keep the internal FormGroup in sync
    if (this.disabled) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  /** Required for NG_VALUE_ACCESSOR */
  writeValue(selectedItems: AccessItemValue[]): void {
    // Modifying the selection list, mistakenly fires valueChanges in the
    // internal form array, so we need to know to pause external notification
    this.pauseChangeNotification = true;

    // Always clear the internal selection list on a new value
    this.selectionList.deselectAll();

    // We need to also select any read only items to appear in the table
    this.selectionList.selectItems(this.items.filter((m) => m.readonly).map((m) => m.id));

    // If the new value is null, then we're done
    if (selectedItems == null) {
      this.pauseChangeNotification = false;
      return;
    }

    // Unable to handle other value types, throw
    if (!Array.isArray(selectedItems)) {
      throw new Error("The access selector component only supports Array form values!");
    }

    // Iterate and internally select each item
    for (const value of selectedItems) {
      this.selectionList.selectItem(value.id, value);
    }

    this.pauseChangeNotification = false;
  }

  ngOnInit() {
    // Watch the internal formArray for changes and propagate them
    this.selectionList.formArray.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((v) => {
      if (!this.notifyOnChange || this.pauseChangeNotification) {
        return;
      }
      this.notifyOnChange(v);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected handleBlur() {
    if (!this.notifyOnTouch) {
      return;
    }

    this.notifyOnTouch();
  }

  protected selectItems(items: SelectItemView[]) {
    this.pauseChangeNotification = true;
    this.selectionList.selectItems(items.map((i) => i.id));
    this.pauseChangeNotification = false;
    if (this.notifyOnChange != undefined) {
      this.notifyOnChange(this.selectionList.formArray.value);
    }
  }

  protected itemIcon(item: AccessItemView) {
    switch (item.type) {
      case AccessItemType.Collection:
        return "bwi-collection";
      case AccessItemType.Group:
        return "bwi-users";
      case AccessItemType.Member:
        return "bwi-user";
    }
  }

  protected permissionLabelId(perm: CollectionPermission) {
    return this.permissionList.find((p) => p.perm == perm)?.labelId;
  }

  protected accessAllLabelId(item: AccessItemView) {
    return item.type == AccessItemType.Group ? "groupAccessAll" : "memberAccessAll";
  }

  protected canEditItemPermission(item: AccessItemView) {
    return this.permissionMode == PermissionMode.Edit && !item.readonly && !item.accessAllItems;
  }

  private _itemComparator(a: AccessItemView, b: AccessItemView) {
    if (a.type != b.type) {
      return a.type - b.type;
    }
    return this.i18nService.collator.compare(
      a.listName + a.labelName + a.readonly,
      b.listName + b.labelName + b.readonly
    );
  }
}
