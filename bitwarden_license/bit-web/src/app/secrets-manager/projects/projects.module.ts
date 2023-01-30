import { NgModule } from "@angular/core";

import { BreadcrumbsModule } from "@bitwarden/components";

import { SecretsManagerSharedModule } from "../shared/sm-shared.module";

import { ProjectDeleteDialogComponent } from "./dialog/project-delete-dialog.component";
import { ProjectDialogComponent } from "./dialog/project-dialog.component";
import { ProjectSecretsComponent } from "./project/project-secrets.component";
import { ProjectComponent } from "./project/project.component";
import { ProjectsListComponent } from "./projects-list/projects-list.component";
import { ProjectsRoutingModule } from "./projects-routing.module";
import { ProjectsComponent } from "./projects/projects.component";

@NgModule({
  imports: [SecretsManagerSharedModule, ProjectsRoutingModule, BreadcrumbsModule],
  declarations: [
    ProjectsComponent,
    ProjectsListComponent,
    ProjectDialogComponent,
    ProjectDeleteDialogComponent,
    ProjectComponent,
    ProjectSecretsComponent,
  ],
  providers: [],
})
export class ProjectsModule {}
