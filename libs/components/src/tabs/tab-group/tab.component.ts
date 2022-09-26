import { TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";

import { TabLabelDirective } from "./tab-label.directive";

@Component({
  selector: "bit-tab",
  templateUrl: "./tab.component.html",
  host: {
    role: "tabpanel",
  },
})
export class TabComponent implements OnInit {
  @Input() disabled = false;

  @Input("label") textLabel = "";

  @ViewChild(TemplateRef, { static: true }) implicitContent: TemplateRef<unknown>;
  @ContentChild(TabLabelDirective) templateLabel: TabLabelDirective;

  private _contentPortal: TemplatePortal | null = null;

  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  isActive: boolean;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(this.implicitContent, this._viewContainerRef);
  }
}
