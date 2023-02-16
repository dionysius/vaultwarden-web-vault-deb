import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  combineLatest,
  combineLatestWith,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";

import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { DialogService } from "@bitwarden/components";

import { ProjectListView } from "../models/view/project-list.view";
import { SecretListView } from "../models/view/secret-list.view";
import {
  ProjectDeleteDialogComponent,
  ProjectDeleteOperation,
} from "../projects/dialog/project-delete-dialog.component";
import {
  OperationType,
  ProjectDialogComponent,
  ProjectOperation,
} from "../projects/dialog/project-dialog.component";
import { ProjectService } from "../projects/project.service";
import {
  SecretDeleteDialogComponent,
  SecretDeleteOperation,
} from "../secrets/dialog/secret-delete.component";
import { SecretDialogComponent, SecretOperation } from "../secrets/dialog/secret-dialog.component";
import { SecretService } from "../secrets/secret.service";

@Component({
  selector: "sm-overview",
  templateUrl: "./overview.component.html",
})
export class OverviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  /**
   * Number of items to show in tables
   */
  private tableSize = 10;
  private organizationId: string;

  protected organizationName: string;
  protected view$: Observable<{
    allProjects: ProjectListView[];
    allSecrets: SecretListView[];
    latestProjects: ProjectListView[];
    latestSecrets: SecretListView[];
  }>;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private dialogService: DialogService,
    private organizationService: OrganizationService,
    private secretService: SecretService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        map((params) => this.organizationService.get(params.organizationId)),
        takeUntil(this.destroy$)
      )
      .subscribe((org) => {
        this.organizationId = org.id;
        this.organizationName = org.name;
      });

    const projects$ = this.projectService.project$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(() => this.getProjects())
    );

    const secrets$ = this.secretService.secret$.pipe(
      startWith(null),
      combineLatestWith(this.route.params),
      switchMap(() => this.getSecrets())
    );

    this.view$ = combineLatest([projects$, secrets$]).pipe(
      map(([projects, secrets]) => {
        return {
          allProjects: projects,
          allSecrets: secrets,
          latestProjects: this.getRecentItems(projects, this.tableSize),
          latestSecrets: this.getRecentItems(secrets, this.tableSize),
        };
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getRecentItems<T extends { revisionDate: string }[]>(items: T, length: number): T {
    return items
      .sort((a, b) => {
        return new Date(b.revisionDate).getTime() - new Date(a.revisionDate).getTime();
      })
      .slice(0, length) as T;
  }

  // Projects ---

  private async getProjects(): Promise<ProjectListView[]> {
    return await this.projectService.getProjects(this.organizationId);
  }

  openEditProject(projectId: string) {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        projectId: projectId,
      },
    });
  }

  openNewProjectDialog() {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
      },
    });
  }

  openDeleteProjectDialog(event: ProjectListView[]) {
    this.dialogService.open<unknown, ProjectDeleteOperation>(ProjectDeleteDialogComponent, {
      data: {
        projects: event,
      },
    });
  }

  // Secrets ---

  private async getSecrets(): Promise<SecretListView[]> {
    return await this.secretService.getSecrets(this.organizationId);
  }

  openEditSecret(secretId: string) {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        secretId: secretId,
      },
    });
  }

  openDeleteSecret(secretIds: string[]) {
    this.dialogService.open<unknown, SecretDeleteOperation>(SecretDeleteDialogComponent, {
      data: {
        secretIds: secretIds,
      },
    });
  }

  openNewSecretDialog() {
    this.dialogService.open<unknown, SecretOperation>(SecretDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Add,
      },
    });
  }
}
