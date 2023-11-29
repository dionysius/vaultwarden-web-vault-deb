import { MessagingService as AbstractMessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";

import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../background/service-factories/factory-options";
import BrowserMessagingService from "../../services/browser-messaging.service";

type MessagingServiceFactoryOptions = FactoryOptions;

export type MessagingServiceInitOptions = MessagingServiceFactoryOptions;

export function messagingServiceFactory(
  cache: { messagingService?: AbstractMessagingService } & CachedServices,
  opts: MessagingServiceInitOptions,
): Promise<AbstractMessagingService> {
  return factory(cache, "messagingService", opts, () => new BrowserMessagingService());
}
