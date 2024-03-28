export abstract class AnonymousHubService {
  createHubConnection: (token: string) => Promise<void>;
  stopHubConnection: () => Promise<void>;
}
