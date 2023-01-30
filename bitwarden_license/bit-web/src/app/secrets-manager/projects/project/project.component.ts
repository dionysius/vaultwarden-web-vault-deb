import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, switchMap } from "rxjs";

import { ProjectView } from "../../models/view/project.view";
import { ProjectService } from "../project.service";

@Component({
  selector: "sm-project",
  templateUrl: "./project.component.html",
})
export class ProjectComponent implements OnInit {
  project$: Observable<ProjectView>;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.project$ = this.route.params.pipe(
      switchMap((params) => {
        return this.projectService.getByProjectId(params.projectId);
      })
    );
  }
}
