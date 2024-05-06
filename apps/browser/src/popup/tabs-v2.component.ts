import { Component } from "@angular/core";

@Component({
  selector: "app-tabs-v2",
  template: `
    <popup-tab-navigation>
      <router-outlet></router-outlet>
    </popup-tab-navigation>
  `,
})
export class TabsV2Component {}
