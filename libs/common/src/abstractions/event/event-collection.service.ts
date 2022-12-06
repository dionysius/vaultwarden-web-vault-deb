import { EventType } from "../../enums/eventType";

export abstract class EventCollectionService {
  collect: (
    eventType: EventType,
    cipherId?: string,
    uploadImmediately?: boolean,
    organizationId?: string
  ) => Promise<any>;
}
