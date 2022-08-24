export interface MessageBase {
  command: string;
}

export abstract class BroadcasterService {
  send: (message: MessageBase, id?: string) => void;
  subscribe: (id: string, messageCallback: (message: MessageBase) => void) => void;
  unsubscribe: (id: string) => void;
}
