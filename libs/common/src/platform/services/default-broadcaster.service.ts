import { Subscription } from "rxjs";

import { BroadcasterService, MessageBase } from "../abstractions/broadcaster.service";
import { MessageListener, MessageSender } from "../messaging";

/**
 * Temporary implementation that just delegates to the message sender and message listener
 * and manages their subscriptions.
 */
export class DefaultBroadcasterService implements BroadcasterService {
  subscriptions = new Map<string, Subscription>();

  constructor(
    private readonly messageSender: MessageSender,
    private readonly messageListener: MessageListener,
  ) {}

  send(message: MessageBase, id?: string) {
    this.messageSender.send(message?.command, message);
  }

  subscribe(id: string, messageCallback: (message: MessageBase) => void) {
    this.subscriptions.set(
      id,
      this.messageListener.allMessages$.subscribe((message) => {
        messageCallback(message);
      }),
    );
  }

  unsubscribe(id: string) {
    const subscription = this.subscriptions.get(id);
    subscription?.unsubscribe();
    this.subscriptions.delete(id);
  }
}
