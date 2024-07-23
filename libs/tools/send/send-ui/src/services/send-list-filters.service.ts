import { Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { map, Observable, startWith } from "rxjs";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { Send } from "@bitwarden/common/tools/send/models/domain/send";
import { ITreeNodeObject, TreeNode } from "@bitwarden/common/vault/models/domain/tree-node";
import { ChipSelectOption } from "@bitwarden/components";

export type SendListFilter = {
  sendType: SendType | null;
};

const INITIAL_FILTERS: SendListFilter = {
  sendType: null,
};

@Injectable({
  providedIn: "root",
})
export class SendListFiltersService {
  /**
   * UI form for all filters
   */
  filterForm = this.formBuilder.group<SendListFilter>(INITIAL_FILTERS);

  /**
   * Observable for `filterForm` value
   */
  filters$ = this.filterForm.valueChanges.pipe(
    startWith(INITIAL_FILTERS),
  ) as Observable<SendListFilter>;

  constructor(
    private i18nService: I18nService,
    private formBuilder: FormBuilder,
  ) {}

  /**
   * Observable whose value is a function that filters an array of `Send` objects based on the current filters
   */
  filterFunction$: Observable<(send: Send[]) => Send[]> = this.filters$.pipe(
    map(
      (filters) => (sends: Send[]) =>
        sends.filter((send) => {
          // do not show disabled sends
          if (send.disabled) {
            return false;
          }

          if (filters.sendType !== null && send.type !== filters.sendType) {
            return false;
          }

          return true;
        }),
    ),
  );

  /**
   * All available send types
   */
  readonly sendTypes: ChipSelectOption<SendType>[] = [
    {
      value: SendType.File,
      label: this.i18nService.t("file"),
      icon: "bwi-file",
    },
    {
      value: SendType.Text,
      label: this.i18nService.t("text"),
      icon: "bwi-file-text",
    },
  ];

  /** Resets `filterForm` to the original state */
  resetFilterForm(): void {
    this.filterForm.reset(INITIAL_FILTERS);
  }

  /**
   * Converts the given item into the `ChipSelectOption` structure
   */
  private convertToChipSelectOption<T extends ITreeNodeObject>(
    item: TreeNode<T>,
    icon: string,
  ): ChipSelectOption<T> {
    return {
      value: item.node,
      label: item.node.name,
      icon,
      children: item.children
        ? item.children.map((i) => this.convertToChipSelectOption(i, icon))
        : undefined,
    };
  }
}
