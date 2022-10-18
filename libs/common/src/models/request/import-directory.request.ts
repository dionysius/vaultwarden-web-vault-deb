import { ImportDirectoryRequestGroup } from "./import-directory-request-group";
import { ImportDirectoryRequestUser } from "./import-directory-request-user";

export class ImportDirectoryRequest {
  groups: ImportDirectoryRequestGroup[] = [];
  users: ImportDirectoryRequestUser[] = [];
  overwriteExisting = false;
  largeImport = false;
}
