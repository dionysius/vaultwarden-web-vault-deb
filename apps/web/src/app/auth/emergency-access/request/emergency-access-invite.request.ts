import { EmergencyAccessType } from "../enums/emergency-access-type";

export class EmergencyAccessInviteRequest {
  email: string;
  type: EmergencyAccessType;
  waitTimeDays: number;
}
