export abstract class MessagingService {
  abstract send(subscriber: string, arg?: any): void;
}
