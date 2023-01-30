import { BaseResponse } from "../response/base.response";

export class BillingSyncConfigApi extends BaseResponse {
  billingSyncKey: string;
  lastLicenseSync: Date;

  constructor(data: any) {
    super(data);
    if (data == null) {
      return;
    }
    this.billingSyncKey = this.getResponseProperty("BillingSyncKey");

    const lastLicenseSyncString = this.getResponseProperty("LastLicenseSync");
    if (lastLicenseSyncString) {
      this.lastLicenseSync = new Date(lastLicenseSyncString);
    }
  }
}
