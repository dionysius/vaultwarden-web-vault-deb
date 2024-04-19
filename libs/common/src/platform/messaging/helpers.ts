import { MonoTypeOperatorFunction, map } from "rxjs";

import { Message, CommandDefinition } from "./types";

export const getCommand = (commandDefinition: CommandDefinition<object> | string) => {
  if (typeof commandDefinition === "string") {
    return commandDefinition;
  } else {
    return commandDefinition.command;
  }
};

export const EXTERNAL_SOURCE_TAG = Symbol("externalSource");

export const isExternalMessage = (message: Message<object>) => {
  return (message as Record<PropertyKey, unknown>)?.[EXTERNAL_SOURCE_TAG] === true;
};

export const tagAsExternal: MonoTypeOperatorFunction<Message<object>> = map(
  (message: Message<object>) => {
    return Object.assign(message, { [EXTERNAL_SOURCE_TAG]: true });
  },
);
