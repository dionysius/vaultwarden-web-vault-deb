export class ProjectView {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;
}

export class ProjectPermissionDetailsView extends ProjectView {
  read: boolean;
  write: boolean;
}
