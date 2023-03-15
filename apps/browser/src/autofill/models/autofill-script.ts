export default class AutofillScript {
  script: string[][] = [];
  documentUUID: any = {};
  properties: any = {};
  options: any = {};
  metadata: any = {};
  autosubmit: any = null;
  savedUrls: string[];
  untrustedIframe: boolean;

  constructor(documentUUID: string) {
    this.documentUUID = documentUUID;
  }
}
