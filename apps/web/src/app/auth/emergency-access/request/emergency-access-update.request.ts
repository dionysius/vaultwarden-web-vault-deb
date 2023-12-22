import { EmergencyAccessType } from "../enums/emergency-access-type";

export class EmergencyAccessUpdateRequest {
  type: EmergencyAccessType;
  waitTimeDays: number;
  keyEncrypted?: string;
}

export class EmergencyAccessWithIdRequest extends EmergencyAccessUpdateRequest {
  id: string;
}
