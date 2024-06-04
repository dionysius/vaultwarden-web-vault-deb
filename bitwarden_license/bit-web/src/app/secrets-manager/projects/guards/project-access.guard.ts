import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, createUrlTreeFromSnapshot } from "@angular/router";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { ProjectService } from "../project.service";

/**
 * Redirects to projects list if the user doesn't have access to project.
 */
export const projectAccessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const projectService = inject(ProjectService);
  const platformUtilsService = inject(PlatformUtilsService);
  const i18nService = inject(I18nService);

  try {
    const project = await projectService.getByProjectId(route.params.projectId);
    if (project) {
      return true;
    }
  } catch {
    platformUtilsService.showToast(
      "error",
      null,
      i18nService.t("notFound", i18nService.t("project")),
    );
    return createUrlTreeFromSnapshot(route, ["/sm", route.params.organizationId, "projects"]);
  }
  return createUrlTreeFromSnapshot(route, ["/sm", route.params.organizationId, "projects"]);
};
