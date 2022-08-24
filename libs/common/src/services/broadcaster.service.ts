import {
  BroadcasterService as BroadcasterServiceAbstraction,
  MessageBase,
} from "../abstractions/broadcaster.service";

export class BroadcasterService implements BroadcasterServiceAbstraction {
  subscribers: Map<string, (message: MessageBase) => void> = new Map<
    string,
    (message: MessageBase) => void
  >();

  send(message: MessageBase, id?: string) {
    if (id != null) {
      if (this.subscribers.has(id)) {
        this.subscribers.get(id)(message);
      }
      return;
    }

    this.subscribers.forEach((value) => {
      value(message);
    });
  }

  subscribe(id: string, messageCallback: (message: MessageBase) => void) {
    this.subscribers.set(id, messageCallback);
  }

  unsubscribe(id: string) {
    if (this.subscribers.has(id)) {
      this.subscribers.delete(id);
    }
  }
}
