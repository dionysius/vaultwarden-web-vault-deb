declare const tag: unique symbol;

/**
 * A class for defining information about a message, this is helpful
 * alonside `MessageSender` and `MessageListener` for providing a type
 * safe(-ish) way of sending and receiving messages.
 */
export class CommandDefinition<T extends object> {
  [tag]: T;
  constructor(readonly command: string) {}
}

export type Message<T extends object> = { command: string } & T;
