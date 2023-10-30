export class OrganizationDomainRequest {
  txt: string;
  domainName: string;

  constructor(txt: string, domainName: string) {
    this.txt = txt;
    this.domainName = domainName;
  }
}
