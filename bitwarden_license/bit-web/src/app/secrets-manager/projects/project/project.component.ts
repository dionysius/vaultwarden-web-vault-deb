import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  combineLatest,
  filter,
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  map,
  concatMap,
} from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

import { ProjectView } from "../../models/view/project.view";
import {
  OperationType,
  ProjectDialogComponent,
  ProjectOperation,
} from "../dialog/project-dialog.component";
import { ProjectService } from "../project.service";

@Component({
  selector: "sm-project",
  templateUrl: "./project.component.html",
})
export class ProjectComponent implements OnInit, OnDestroy {
  protected project$: Observable<ProjectView>;

  private organizationId: string;
  private projectId: string;
  private organizationEnabled: boolean;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router,
    private dialogService: DialogService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
  ) {}

  ngOnInit(): void {
    // Update project if it is edited
    const currentProjectEdited = this.projectService.project$.pipe(
      filter((p) => p?.id === this.projectId),
      startWith(null),
    );

    this.project$ = combineLatest([this.route.params, currentProjectEdited]).pipe(
      switchMap(([params, _]) => this.projectService.getByProjectId(params.projectId)),
    );

    const projectId$ = this.route.params.pipe(map((p) => p.projectId));
    const organization$ = this.route.params.pipe(
      concatMap((params) => this.organizationService.get$(params.organizationId)),
    );

    combineLatest([projectId$, organization$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([projectId, organization]) => {
        this.organizationId = organization.id;
        this.projectId = projectId;
        this.organizationEnabled = organization.enabled;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async openEditDialog() {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        organizationEnabled: this.organizationEnabled,
        projectId: this.projectId,
      },
    });
  }
}
