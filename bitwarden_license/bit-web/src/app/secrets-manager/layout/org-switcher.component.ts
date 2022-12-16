import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, map, Observable } from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import type { Organization } from "@bitwarden/common/models/domain/organization";

@Component({
  selector: "org-switcher",
  templateUrl: "org-switcher.component.html",
})
export class OrgSwitcherComponent {
  protected organizations$: Observable<Organization[]> = this.organizationService.organizations$;
  protected activeOrganization$: Observable<Organization> = combineLatest([
    this.route.paramMap,
    this.organizationService.organizations$,
  ]).pipe(map(([params, orgs]) => orgs.find((org) => org.id === params.get("organizationId"))));

  /**
   * Is `true` if the expanded content is visible
   */
  @Input()
  open = false;
  @Output()
  openChange = new EventEmitter<boolean>();

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  protected toggle(event?: MouseEvent) {
    event?.stopPropagation();
    this.open = !this.open;
    this.openChange.emit(this.open);
  }
}
