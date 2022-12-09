import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ProjectSecretsComponent } from "./project/project-secrets.component";
import { ProjectComponent } from "./project/project.component";
import { ProjectsComponent } from "./projects/projects.component";

const routes: Routes = [
  {
    path: "",
    component: ProjectsComponent,
  },
  {
    path: ":projectId",
    component: ProjectComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "secrets",
      },
      {
        path: "secrets",
        component: ProjectSecretsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
