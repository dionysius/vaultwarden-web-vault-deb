import { EventType } from "../../enums";

export class EventRequest {
  type: EventType;
  cipherId: string;
  date: string;
  organizationId: string;
}
