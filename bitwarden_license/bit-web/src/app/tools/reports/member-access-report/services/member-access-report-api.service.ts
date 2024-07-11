import { Injectable } from "@angular/core";

import { MemberAccessReportModel } from "../model/member-access-report.model";

import { memberAccessReportsMock } from "./member-access-report.mock";

@Injectable({ providedIn: "root" })
export class MemberAccessReportApiService {
  getMemberAccessData(): MemberAccessReportModel[] {
    return memberAccessReportsMock;
  }
}
