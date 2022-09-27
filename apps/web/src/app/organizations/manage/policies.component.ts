import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { PolicyResponse } from "@bitwarden/common/models/response/policyResponse";

import { PolicyListService } from "../../core";
import { BasePolicy } from "../policies/base-policy.component";

import { PolicyEditComponent } from "./policy-edit.component";

@Component({
  selector: "app-org-policies",
  templateUrl: "policies.component.html",
})
// eslint-disable-next-line rxjs-angular/prefer-takeuntil
export class PoliciesComponent implements OnInit {
  @ViewChild("editTemplate", { read: ViewContainerRef, static: true })
  editModalRef: ViewContainerRef;

  loading = true;
  organizationId: string;
  policies: BasePolicy[];
  organization: Organization;

  private orgPolicies: PolicyResponse[];
  private policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();

  constructor(
    private route: ActivatedRoute,
    private modalService: ModalService,
    private organizationService: OrganizationService,
    private policyApiService: PolicyApiServiceAbstraction,
    private policyListService: PolicyListService,
    private router: Router
  ) {}

  async ngOnInit() {
    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      this.organization = await this.organizationService.get(this.organizationId);
      this.policies = this.policyListService.getPolicies();

      await this.load();

      // Handle policies component launch from Event message
      /* eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe, rxjs/no-nested-subscribe */
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        if (qParams.policyId != null) {
          const policyIdFromEvents: string = qParams.policyId;
          for (const orgPolicy of this.orgPolicies) {
            if (orgPolicy.id === policyIdFromEvents) {
              for (let i = 0; i < this.policies.length; i++) {
                if (this.policies[i].type === orgPolicy.type) {
                  this.edit(this.policies[i]);
                  break;
                }
              }
              break;
            }
          }
        }
      });
    });
  }

  async load() {
    const response = await this.policyApiService.getPolicies(this.organizationId);
    this.orgPolicies = response.data != null && response.data.length > 0 ? response.data : [];
    this.orgPolicies.forEach((op) => {
      this.policiesEnabledMap.set(op.type, op.enabled);
    });

    this.loading = false;
  }

  async edit(policy: BasePolicy) {
    const [modal] = await this.modalService.openViewRef(
      PolicyEditComponent,
      this.editModalRef,
      (comp) => {
        comp.policy = policy;
        comp.organizationId = this.organizationId;
        comp.policiesEnabledMap = this.policiesEnabledMap;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onSavedPolicy.subscribe(() => {
          modal.close();
          this.load();
        });
      }
    );
  }
}
