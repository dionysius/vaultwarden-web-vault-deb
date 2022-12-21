import { Pipe, PipeTransform } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

@Pipe({
  name: "i18n",
})
export class I18nPipe<TKey = string> implements PipeTransform {
  constructor(private i18nService: I18nService<TKey>) {}

  transform(id: TKey, p1?: string | number, p2?: string | number, p3?: string | number): string {
    return this.i18nService.t(id, p1, p2, p3);
  }
}
