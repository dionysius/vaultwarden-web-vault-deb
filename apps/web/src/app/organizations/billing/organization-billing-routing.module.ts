import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessBillingTab } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

import { PaymentMethodComponent } from "../../settings/payment-method.component";
import { OrganizationPermissionsGuard } from "../guards/org-permissions.guard";

import { OrgBillingHistoryViewComponent } from "./organization-billing-history-view.component";
import { OrganizationBillingTabComponent } from "./organization-billing-tab.component";
import { OrganizationSubscriptionComponent } from "./organization-subscription.component";

const routes: Routes = [
  {
    path: "",
    component: OrganizationBillingTabComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: { organizationPermissions: canAccessBillingTab },
    children: [
      { path: "", pathMatch: "full", redirectTo: "subscription" },
      {
        path: "subscription",
        component: OrganizationSubscriptionComponent,
        data: { titleId: "subscription" },
      },
      {
        path: "payment-method",
        component: PaymentMethodComponent,
        data: {
          titleId: "paymentMethod",
        },
      },
      {
        path: "history",
        component: OrgBillingHistoryViewComponent,
        data: {
          titleId: "billingHistory",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationBillingRoutingModule {}
