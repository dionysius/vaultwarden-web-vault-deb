import { AuthService } from "./auth.service";

export abstract class SystemService {
  startProcessReload: (authService: AuthService) => Promise<void>;
  cancelProcessReload: () => void;
  clearClipboard: (clipboardValue: string, timeoutMs?: number) => Promise<void>;
  clearPendingClipboard: () => Promise<any>;
}
