import { Component, ContentChildren, Input, QueryList } from "@angular/core";

import { BreadcrumbComponent } from "./breadcrumb.component";

@Component({
  selector: "bit-breadcrumbs",
  templateUrl: "./breadcrumbs.component.html",
})
export class BreadcrumbsComponent {
  @Input()
  show = 3;

  private breadcrumbs: BreadcrumbComponent[] = [];

  @ContentChildren(BreadcrumbComponent)
  protected set breadcrumbList(value: QueryList<BreadcrumbComponent>) {
    this.breadcrumbs = value.toArray();
  }

  protected get beforeOverflow() {
    if (this.hasOverflow) {
      return this.breadcrumbs.slice(0, this.show - 1);
    }

    return this.breadcrumbs;
  }

  protected get overflow() {
    return this.breadcrumbs.slice(this.show - 1, -1);
  }

  protected get afterOverflow() {
    return this.breadcrumbs.slice(-1);
  }

  protected get hasOverflow() {
    return this.breadcrumbs.length > this.show;
  }
}
