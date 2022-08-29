import { MessagingService as AbstractMessagingService } from "@bitwarden/common/abstractions/messaging.service";

import BrowserMessagingService from "../../services/browserMessaging.service";

import { CachedServices, factory, FactoryOptions } from "./factory-options";

type MessagingServiceFactoryOptions = FactoryOptions;

export type MessagingServiceInitOptions = MessagingServiceFactoryOptions;

export function messagingServiceFactory(
  cache: { messagingService?: AbstractMessagingService } & CachedServices,
  opts: MessagingServiceInitOptions
): Promise<AbstractMessagingService> {
  return factory(cache, "messagingService", opts, () => new BrowserMessagingService());
}
