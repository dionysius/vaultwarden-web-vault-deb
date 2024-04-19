import { MessageSender } from "@bitwarden/common/platform/messaging";

import { CachedServices, factory, FactoryOptions } from "./factory-options";

type MessagingServiceFactoryOptions = FactoryOptions;

export type MessageSenderInitOptions = MessagingServiceFactoryOptions;

export function messageSenderFactory(
  cache: { messagingService?: MessageSender } & CachedServices,
  opts: MessageSenderInitOptions,
): Promise<MessageSender> {
  // NOTE: Name needs to match that of MainBackground property until we delete these.
  return factory(cache, "messagingService", opts, () => {
    throw new Error("Not implemented, not expected to be used.");
  });
}
