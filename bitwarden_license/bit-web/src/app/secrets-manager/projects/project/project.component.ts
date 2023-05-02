import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  catchError,
  combineLatest,
  filter,
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from "rxjs";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";

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

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private router: Router,
    private dialogService: DialogServiceAbstraction
  ) {}

  ngOnInit(): void {
    // Update project if it is edited
    const currentProjectEdited = this.projectService.project$.pipe(
      filter((p) => p?.id === this.projectId),
      startWith(null)
    );

    this.project$ = combineLatest([this.route.params, currentProjectEdited]).pipe(
      switchMap(([params, _]) => {
        return this.projectService.getByProjectId(params.projectId);
      }),
      catchError(async () => this.handleError())
    );

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organizationId = params.organizationId;
      this.projectId = params.projectId;
    });
  }

  handleError = () => {
    const projectsListUrl = `/sm/${this.organizationId}/projects/`;
    this.router.navigate([projectsListUrl]);
    return new ProjectView();
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async openEditDialog() {
    this.dialogService.open<unknown, ProjectOperation>(ProjectDialogComponent, {
      data: {
        organizationId: this.organizationId,
        operation: OperationType.Edit,
        projectId: this.projectId,
      },
    });
  }
}
