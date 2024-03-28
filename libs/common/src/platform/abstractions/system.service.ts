import { AuthService } from "../../auth/abstractions/auth.service";

export abstract class SystemService {
  abstract startProcessReload(authService: AuthService): Promise<void>;
  abstract cancelProcessReload(): void;
  abstract clearClipboard(clipboardValue: string, timeoutMs?: number): Promise<void>;
  abstract clearPendingClipboard(): Promise<any>;
}
