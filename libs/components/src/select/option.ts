import { TemplateRef } from "@angular/core";

export interface Option<T> {
  icon?: string;
  value?: T;
  label?: string;
  content?: TemplateRef<unknown>;
}
