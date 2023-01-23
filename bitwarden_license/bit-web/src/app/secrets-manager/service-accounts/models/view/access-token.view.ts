export class AccessTokenView {
  id: string;
  name: string;
  scopes: string[];
  expireAt?: Date;
  creationDate: Date;
  revisionDate: Date;
}
