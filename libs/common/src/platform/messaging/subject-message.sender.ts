import { Subject } from "rxjs";

import { getCommand } from "./internal";
import { MessageSender } from "./message.sender";
import { Message, CommandDefinition } from "./types";

export class SubjectMessageSender implements MessageSender {
  constructor(private readonly messagesSubject: Subject<Message<object>>) {}

  send<T extends object>(
    commandDefinition: string | CommandDefinition<T>,
    payload: object | T = {},
  ): void {
    const command = getCommand(commandDefinition);
    this.messagesSubject.next(Object.assign(payload ?? {}, { command: command }));
  }
}
