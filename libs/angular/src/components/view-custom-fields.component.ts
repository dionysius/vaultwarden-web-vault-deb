import { Directive, Input } from "@angular/core";

import { EventService } from "@bitwarden/common/abstractions/event.service";
import { EventType } from "@bitwarden/common/enums/eventType";
import { FieldType } from "@bitwarden/common/enums/fieldType";
import { CipherView } from "@bitwarden/common/models/view/cipher.view";
import { FieldView } from "@bitwarden/common/models/view/field.view";

@Directive()
export class ViewCustomFieldsComponent {
  @Input() cipher: CipherView;
  @Input() promptPassword: () => Promise<boolean>;
  @Input() copy: (value: string, typeI18nKey: string, aType: string) => void;

  fieldType = FieldType;

  constructor(private eventService: EventService) {}

  async toggleFieldValue(field: FieldView) {
    if (!(await this.promptPassword())) {
      return;
    }

    const f = field as any;
    f.showValue = !f.showValue;
    f.showCount = false;
    if (f.showValue) {
      this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, this.cipher.id);
    }
  }

  async toggleFieldCount(field: FieldView) {
    if (!field.showValue) {
      return;
    }

    field.showCount = !field.showCount;
  }

  setTextDataOnDrag(event: DragEvent, data: string) {
    event.dataTransfer.setData("text", data);
  }
}
