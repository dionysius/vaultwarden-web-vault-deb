export abstract class AnonymousHubService {
  createHubConnection: (token: string) => void;
  stopHubConnection: () => void;
}
