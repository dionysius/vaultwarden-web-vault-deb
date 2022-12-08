import { Component, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

let nextId = 0;

@Component({
  selector: "app-search-input",
  templateUrl: "./search-input.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SearchInputComponent,
    },
  ],
})
export class SearchInputComponent implements ControlValueAccessor {
  private notifyOnChange: (v: string) => void;
  private notifyOnTouch: () => void;

  protected id = `search-id-${nextId++}`;
  protected searchText: string;

  @Input() disabled: boolean;
  @Input() placeholder: string;

  onChange(searchText: string) {
    if (this.notifyOnChange != undefined) {
      this.notifyOnChange(searchText);
    }
  }

  onTouch() {
    if (this.notifyOnTouch != undefined) {
      this.notifyOnTouch();
    }
  }

  registerOnChange(fn: (v: string) => void): void {
    this.notifyOnChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.notifyOnTouch = fn;
  }

  writeValue(searchText: string): void {
    this.searchText = searchText;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
